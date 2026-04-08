import { apiRequest } from '../apiClient';
import { createLogger } from '../logger';
import { API_KEYS, API_URLS, isApiKeyConfigured } from '../../config/apiKeys';
import { Flight, FlightSegment, Airport, Airline, SearchQuery, CabinClass } from '../../types';
import { AIRPORTS } from '../../constants/airports';
import { AIRLINES, getAirlineByCode } from '../../constants/airlines';
import { generateId } from '../../utils/helpers';

const log = createLogger('AmadeusAPI');

let accessToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  log.info('Refreshing Amadeus access token');

  const response = await apiRequest<{ access_token: string; expires_in: number }>({
    url: API_URLS.AMADEUS_AUTH,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${API_KEYS.AMADEUS_CLIENT_ID}&client_secret=${API_KEYS.AMADEUS_CLIENT_SECRET}`,
    retries: 2,
  });

  accessToken = response.access_token;
  tokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
  return accessToken;
};

const cabinClassMap: Record<CabinClass, string> = {
  business: 'BUSINESS',
  first: 'FIRST',
};

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; terminal?: string; at: string };
      arrival: { iataCode: string; terminal?: string; at: string };
      carrierCode: string;
      number: string;
      aircraft: { code: string };
      operating?: { carrierCode: string };
      duration: string;
      id: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    grandTotal: string;
  };
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      brandedFare?: string;
      amenities?: Array<{
        description: string;
        isChargeable: boolean;
        amenityType: string;
      }>;
    }>;
  }>;
}

const parseDuration = (iso: string): number => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0');
};

const findAirport = (code: string): Airport => {
  return AIRPORTS.find((a) => a.code === code) || {
    code, name: code, city: code, country: 'Unknown', latitude: 0, longitude: 0,
  };
};

const findAirline = (code: string): Airline => {
  return getAirlineByCode(code) || { code, name: code, logo: code, alliance: undefined };
};

const normalizeFlightOffer = (offer: AmadeusFlightOffer, cabinClass: CabinClass): Flight => {
  const itinerary = offer.itineraries[0];
  const segments: FlightSegment[] = itinerary.segments.map((seg, idx) => {
    const fareDetail = offer.travelerPricings?.[0]?.fareDetailsBySegment?.find(
      (f) => f.segmentId === seg.id
    );
    const amenities = fareDetail?.amenities?.map((a) => a.description) || [];

    return {
      id: generateId(),
      airline: findAirline(seg.carrierCode),
      flightNumber: `${seg.carrierCode}${seg.number}`,
      aircraft: seg.aircraft.code,
      departureAirport: findAirport(seg.departure.iataCode),
      arrivalAirport: findAirport(seg.arrival.iataCode),
      departureTime: seg.departure.at,
      arrivalTime: seg.arrival.at,
      duration: parseDuration(seg.duration),
      cabinClass,
      amenities: amenities.length > 0 ? amenities : getDefaultAmenities(cabinClass),
    };
  });

  const totalDuration = parseDuration(itinerary.duration);
  const stops = itinerary.segments.length - 1;
  const price = parseFloat(offer.price.grandTotal);

  return {
    id: `amadeus_${offer.id}`,
    segments,
    totalDuration,
    stops,
    price,
    originalPrice: price, // Amadeus doesn't provide original price
    currency: offer.price.currency,
    cabinClass,
    seatsRemaining: offer.numberOfBookableSeats,
    bookingUrl: `https://www.amadeus.com/book/${offer.id}`,
    fareRules: ['Subject to airline fare rules', 'Change fees may apply'],
    baggageAllowance: cabinClass === 'first' ? '3 x 32kg checked bags' : '2 x 32kg checked bags',
    refundable: offer.pricingOptions.fareType.includes('PUBLISHED'),
    changeable: true,
    loungAccess: true,
    layoverInfo: stops > 0 ? segments.slice(0, -1).map((seg, i) => ({
      airport: segments[i + 1].departureAirport,
      duration: Math.max(
        0,
        (new Date(segments[i + 1].departureTime).getTime() - new Date(seg.arrivalTime).getTime()) / 60000
      ),
      terminalChange: false,
    })) : undefined,
  };
};

const getDefaultAmenities = (cabin: CabinClass): string[] => {
  return cabin === 'first'
    ? ['Private suite', 'Fine dining', 'Lounge access', 'Priority boarding', 'Amenity kit']
    : ['Lie-flat seat', 'Premium dining', 'Lounge access', 'Priority boarding', 'Wi-Fi'];
};

export const searchAmadeusFlights = async (query: SearchQuery): Promise<Flight[]> => {
  if (!isApiKeyConfigured(API_KEYS.AMADEUS_CLIENT_ID)) {
    log.info('Amadeus API not configured, skipping');
    return [];
  }

  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      originLocationCode: query.origin!.code,
      destinationLocationCode: query.destination!.code,
      departureDate: query.departureDate,
      adults: String(query.passengers.adults),
      travelClass: cabinClassMap[query.cabinClass],
      nonStop: query.maxStops === 0 ? 'true' : 'false',
      currencyCode: 'USD',
      max: '20',
    });

    if (query.returnDate && query.tripType === 'roundtrip') {
      params.set('returnDate', query.returnDate);
    }

    const response = await apiRequest<{ data: AmadeusFlightOffer[] }>({
      url: `${API_URLS.AMADEUS_BASE}/v2/shopping/flight-offers?${params}`,
      headers: { Authorization: `Bearer ${token}` },
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      retries: 2,
      timeout: 20000,
    });

    log.info(`Amadeus returned ${response.data?.length || 0} offers`);
    return (response.data || []).map((offer) => normalizeFlightOffer(offer, query.cabinClass));
  } catch (error) {
    log.error('Amadeus search failed', error as Error);
    return [];
  }
};

export const searchAmadeusAirports = async (keyword: string): Promise<Airport[]> => {
  if (!isApiKeyConfigured(API_KEYS.AMADEUS_CLIENT_ID)) return [];

  try {
    const token = await getAccessToken();
    const response = await apiRequest<{
      data: Array<{ iataCode: string; name: string; address: { cityName: string; countryName: string } }>;
    }>({
      url: `${API_URLS.AMADEUS_BASE}/v1/reference-data/locations?subType=AIRPORT&keyword=${keyword}&page[limit]=10`,
      headers: { Authorization: `Bearer ${token}` },
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });

    return (response.data || []).map((a) => ({
      code: a.iataCode,
      name: a.name,
      city: a.address.cityName,
      country: a.address.countryName,
      latitude: 0,
      longitude: 0,
    }));
  } catch {
    return [];
  }
};
