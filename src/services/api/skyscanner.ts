import { apiRequest } from '../apiClient';
import { createLogger } from '../logger';
import { API_KEYS, API_URLS, isApiKeyConfigured } from '../../config/apiKeys';
import { Flight, FlightSegment, SearchQuery, CabinClass, Airport, Airline } from '../../types';
import { AIRPORTS } from '../../constants/airports';
import { AIRLINES, getAirlineByCode } from '../../constants/airlines';
import { generateId } from '../../utils/helpers';

const log = createLogger('SkyscannerAPI');

const cabinMap: Record<CabinClass, string> = {
  business: 'business',
  first: 'first',
};

const findAirport = (code: string): Airport =>
  AIRPORTS.find((a) => a.code === code) || {
    code, name: code, city: code, country: 'Unknown', latitude: 0, longitude: 0,
  };

const findAirline = (code: string): Airline =>
  getAirlineByCode(code) || { code, name: code, logo: code };

interface SkyscannerResult {
  itineraries: Array<{
    id: string;
    price: { raw: number; formatted: string };
    legs: Array<{
      id: string;
      origin: { id: string; name: string; displayCode: string };
      destination: { id: string; name: string; displayCode: string };
      durationInMinutes: number;
      stopCount: number;
      departure: string;
      arrival: string;
      carriers: { marketing: Array<{ id: number; name: string; alternateId: string }> };
      segments: Array<{
        origin: { displayCode: string };
        destination: { displayCode: string };
        departure: string;
        arrival: string;
        durationInMinutes: number;
        flightNumber: string;
        marketingCarrier: { name: string; alternateId: string };
        operatingCarrier: { name: string; alternateId: string };
      }>;
    }>;
  }>;
}

const normalizeSkyscannerResult = (
  itinerary: SkyscannerResult['itineraries'][0],
  cabinClass: CabinClass
): Flight => {
  const leg = itinerary.legs[0];
  const segments: FlightSegment[] = leg.segments.map((seg) => ({
    id: generateId(),
    airline: findAirline(seg.marketingCarrier.alternateId),
    flightNumber: `${seg.marketingCarrier.alternateId}${seg.flightNumber}`,
    aircraft: 'Unknown',
    departureAirport: findAirport(seg.origin.displayCode),
    arrivalAirport: findAirport(seg.destination.displayCode),
    departureTime: seg.departure,
    arrivalTime: seg.arrival,
    duration: seg.durationInMinutes,
    cabinClass,
    amenities: cabinClass === 'first'
      ? ['Private suite', 'Fine dining', 'Lounge access', 'Priority boarding']
      : ['Lie-flat seat', 'Premium dining', 'Lounge access', 'Priority boarding'],
  }));

  return {
    id: `skyscanner_${itinerary.id}`,
    segments,
    totalDuration: leg.durationInMinutes,
    stops: leg.stopCount,
    price: itinerary.price.raw,
    originalPrice: itinerary.price.raw,
    currency: 'USD',
    cabinClass,
    seatsRemaining: 9,
    bookingUrl: `https://www.skyscanner.com/transport/flights/${leg.origin.displayCode}/${leg.destination.displayCode}`,
    fareRules: ['Subject to airline fare rules'],
    baggageAllowance: cabinClass === 'first' ? '3 x 32kg checked bags' : '2 x 32kg checked bags',
    refundable: false,
    changeable: true,
    loungAccess: true,
    layoverInfo: leg.stopCount > 0
      ? segments.slice(0, -1).map((seg, i) => ({
          airport: segments[i + 1].departureAirport,
          duration: Math.max(
            0,
            (new Date(segments[i + 1].departureTime).getTime() - new Date(seg.arrivalTime).getTime()) / 60000
          ),
          terminalChange: false,
        }))
      : undefined,
  };
};

export const searchSkyscannerFlights = async (query: SearchQuery): Promise<Flight[]> => {
  if (!isApiKeyConfigured(API_KEYS.SKYSCANNER_RAPIDAPI_KEY)) {
    log.info('Skyscanner API not configured, skipping');
    return [];
  }

  try {
    const response = await apiRequest<SkyscannerResult>({
      url: `${API_URLS.SKYSCANNER_BASE}/v3/flights/live/search/create`,
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': API_KEYS.SKYSCANNER_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
      },
      body: {
        query: {
          market: 'US',
          locale: 'en-US',
          currency: 'USD',
          queryLegs: [
            {
              originPlaceId: { iata: query.origin!.code },
              destinationPlaceId: { iata: query.destination!.code },
              date: {
                year: parseInt(query.departureDate.split('-')[0]),
                month: parseInt(query.departureDate.split('-')[1]),
                day: parseInt(query.departureDate.split('-')[2]),
              },
            },
          ],
          cabinClass: cabinMap[query.cabinClass],
          adults: query.passengers.adults,
        },
      },
      cacheTTL: 5 * 60 * 1000,
      retries: 2,
      timeout: 25000,
    });

    log.info(`Skyscanner returned ${response.itineraries?.length || 0} itineraries`);
    return (response.itineraries || [])
      .slice(0, 20)
      .map((it) => normalizeSkyscannerResult(it, query.cabinClass));
  } catch (error) {
    log.error('Skyscanner search failed', error as Error);
    return [];
  }
};
