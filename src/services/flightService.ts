import { Flight, SearchQuery, CalendarPrice, DealOfDay, FlightSegment, LayoverInfo } from '../types';
import { AIRPORTS } from '../constants/airports';
import { AIRLINES } from '../constants/airlines';
import { generateId, addDays } from '../utils/helpers';
import { aggregateFlightSearch } from './flightAggregator';
import { createLogger } from './logger';

const log = createLogger('FlightService');

const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const BUSINESS_AMENITIES = [
  'Lie-flat seat', 'Direct aisle access', 'In-flight Wi-Fi', 'Premium dining',
  'Noise-cancelling headphones', 'Amenity kit', 'Priority boarding', 'Lounge access',
  'Power outlets', 'Personal screen 15"', 'Turn-down service',
];

const FIRST_AMENITIES = [
  'Private suite', 'Shower spa', 'In-flight Wi-Fi', 'Multi-course fine dining',
  'Vintage champagne', 'Personal minibar', 'Luxury amenity kit', 'Chauffeur service',
  'Priority boarding', 'Personal screen 32"', 'Pajama set', 'Turndown service',
  'Onboard lounge', 'Direct aisle access',
];

const AIRCRAFT_TYPES = [
  'Boeing 777-300ER', 'Airbus A380', 'Boeing 787-9 Dreamliner', 'Airbus A350-900',
  'Boeing 777-200LR', 'Airbus A330-300', 'Boeing 747-8', 'Airbus A321neo',
];

const generateSegment = (
  origin: typeof AIRPORTS[0],
  destination: typeof AIRPORTS[0],
  cabinClass: 'business' | 'first',
  departureDate: string,
  hourOffset: number = 0
): FlightSegment => {
  const airline = pickRandom(AIRLINES);
  const depHour = randomBetween(6, 22);
  const duration = randomBetween(120, 960);
  const depDate = new Date(departureDate);
  depDate.setHours(depHour + hourOffset, randomBetween(0, 59));

  const arrDate = new Date(depDate.getTime() + duration * 60000);
  const amenities = cabinClass === 'first'
    ? FIRST_AMENITIES.sort(() => Math.random() - 0.5).slice(0, randomBetween(6, 10))
    : BUSINESS_AMENITIES.sort(() => Math.random() - 0.5).slice(0, randomBetween(5, 8));

  return {
    id: generateId(),
    airline,
    flightNumber: `${airline.code}${randomBetween(100, 999)}`,
    aircraft: pickRandom(AIRCRAFT_TYPES),
    departureAirport: origin,
    arrivalAirport: destination,
    departureTime: depDate.toISOString(),
    arrivalTime: arrDate.toISOString(),
    duration,
    cabinClass,
    amenities,
  };
};

const generateFlight = (query: SearchQuery, index: number): Flight => {
  const origin = query.origin!;
  const destination = query.destination!;
  const cabinClass = query.cabinClass;

  const stops = index % 4 === 0 ? 0 : index % 3 === 0 ? 2 : index % 2 === 0 ? 1 : 0;

  const segments: FlightSegment[] = [];
  const layoverInfo: LayoverInfo[] = [];

  if (stops === 0) {
    segments.push(generateSegment(origin, destination, cabinClass, query.departureDate));
  } else {
    const usedAirports = new Set([origin.code, destination.code]);
    const transitAirports = AIRPORTS.filter((a) => !usedAirports.has(a.code));
    const stopAirports = [];

    for (let i = 0; i < stops; i++) {
      const transit = pickRandom(transitAirports);
      stopAirports.push(transit);
      usedAirports.add(transit.code);
    }

    const allPoints = [origin, ...stopAirports, destination];
    for (let i = 0; i < allPoints.length - 1; i++) {
      segments.push(
        generateSegment(allPoints[i], allPoints[i + 1], cabinClass, query.departureDate, i * 4)
      );
      if (i < allPoints.length - 2) {
        layoverInfo.push({
          airport: allPoints[i + 1],
          duration: randomBetween(60, 300),
          terminalChange: Math.random() > 0.7,
        });
      }
    }
  }

  const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0) +
    layoverInfo.reduce((acc, l) => acc + l.duration, 0);

  const basePrice = cabinClass === 'first'
    ? randomBetween(3000, 18000)
    : randomBetween(1500, 9000);

  const discount = Math.random() > 0.6 ? randomBetween(5, 35) : 0;
  const price = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

  return {
    id: generateId(),
    segments,
    totalDuration,
    stops,
    price,
    originalPrice: basePrice,
    currency: 'USD',
    cabinClass,
    seatsRemaining: randomBetween(1, 9),
    bookingUrl: '#',
    fareRules: [
      'Free cancellation within 24 hours',
      cabinClass === 'first' ? 'Unlimited date changes' : 'One free date change',
      'Upgrade to First Class subject to availability',
    ],
    baggageAllowance: cabinClass === 'first' ? '3 x 32kg checked bags' : '2 x 32kg checked bags',
    refundable: Math.random() > 0.4,
    changeable: true,
    loungAccess: true,
    layoverInfo: layoverInfo.length > 0 ? layoverInfo : undefined,
  };
};

export const searchFlights = async (query: SearchQuery): Promise<Flight[]> => {
  // Try real APIs first, fall back to mock data
  try {
    log.info('Searching flights via aggregator', {
      origin: query.origin?.code,
      destination: query.destination?.code,
      cabin: query.cabinClass,
    });

    const result = await aggregateFlightSearch(query);

    if (result.flights.length > 0) {
      log.info(`Found ${result.flights.length} real flights from: ${result.sources.join(', ')}`);
      return result.flights;
    }

    log.info('No real API results, falling back to mock data');
  } catch (error) {
    log.warn('Aggregator failed, using mock data', { error: (error as Error).message });
  }

  // Fallback: generate mock data
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const count = randomBetween(8, 20);
  const flights: Flight[] = [];

  for (let i = 0; i < count; i++) {
    flights.push(generateFlight(query, i));
  }

  return flights.sort((a, b) => a.price - b.price);
};

export const getCalendarPrices = async (
  origin: string,
  destination: string,
  cabinClass: 'business' | 'first',
  month: string
): Promise<CalendarPrice[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  const prices: CalendarPrice[] = [];
  let minPrice = Infinity;

  const tempPrices: { date: string; price: number; available: boolean }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const available = Math.random() > 0.15;
    const price = available
      ? cabinClass === 'first'
        ? randomBetween(3000, 15000)
        : randomBetween(1500, 8000)
      : 0;

    if (available && price < minPrice) minPrice = price;
    tempPrices.push({ date: dateStr, price, available });
  }

  for (const tp of tempPrices) {
    prices.push({
      ...tp,
      cheapest: tp.available && tp.price === minPrice,
    });
  }

  return prices;
};

export const getDealsOfTheDay = async (): Promise<DealOfDay[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const deals: DealOfDay[] = [];
  const routes = [
    { from: 'JFK', to: 'LHR' }, { from: 'LAX', to: 'NRT' }, { from: 'SFO', to: 'SIN' },
    { from: 'MIA', to: 'CDG' }, { from: 'ORD', to: 'DXB' }, { from: 'JFK', to: 'DOH' },
    { from: 'LAX', to: 'SYD' }, { from: 'SFO', to: 'HKG' }, { from: 'DFW', to: 'FCO' },
    { from: 'BOS', to: 'AMS' }, { from: 'SEA', to: 'ICN' }, { from: 'ATL', to: 'FRA' },
  ];

  for (const route of routes) {
    const origin = AIRPORTS.find((a) => a.code === route.from)!;
    const destination = AIRPORTS.find((a) => a.code === route.to)!;
    const cabinClass = Math.random() > 0.5 ? 'first' : 'business' as const;
    const originalPrice = cabinClass === 'first' ? randomBetween(6000, 18000) : randomBetween(2500, 9000);
    const discount = randomBetween(20, 50);
    const price = Math.round(originalPrice * (1 - discount / 100));
    const airline = pickRandom(AIRLINES);

    const today = new Date();
    const departDaysOut = randomBetween(14, 120);
    const departDate = addDays(today.toISOString().split('T')[0], departDaysOut);

    deals.push({
      id: generateId(),
      origin,
      destination,
      cabinClass,
      price,
      originalPrice,
      discount,
      airline,
      departureDate: departDate,
      returnDate: addDays(departDate, randomBetween(5, 21)),
      expiresAt: addDays(today.toISOString().split('T')[0], randomBetween(1, 3)),
      imageUrl: '',
    });
  }

  return deals.sort((a, b) => b.discount - a.discount);
};
