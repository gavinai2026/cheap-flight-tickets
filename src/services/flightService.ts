import { Flight, SearchQuery, CalendarPrice, DealOfDay, FlightSegment, LayoverInfo } from '../types';
import { AIRPORTS } from '../constants/airports';
import { AIRLINES, getAirlineByCode } from '../constants/airlines';
import { generateId, addDays } from '../utils/helpers';
import { aggregateFlightSearch } from './flightAggregator';
import { createLogger } from './logger';

const log = createLogger('FlightService');

// Deterministic pseudo-random based on seed string
const seededRandom = (seed: string): (() => number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return ((hash >>> 0) / 4294967296);
  };
};

const randomBetween = (min: number, max: number, rng: () => number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

const pickRandom = <T>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

// Real airline routes with realistic data
interface RouteData {
  airlineCode: string;
  origin: string;
  destination: string;
  basePriceBusiness: number;
  basePriceFirst: number;
  durationMin: number;
  typicalDepartHour: number;
  aircraft: string;
}

const REAL_ROUTES: RouteData[] = [
  // Emirates
  { airlineCode: 'EK', origin: 'DXB', destination: 'JFK', basePriceBusiness: 4800, basePriceFirst: 12500, durationMin: 840, typicalDepartHour: 3, aircraft: 'Airbus A380' },
  { airlineCode: 'EK', origin: 'DXB', destination: 'LHR', basePriceBusiness: 3200, basePriceFirst: 8500, durationMin: 420, typicalDepartHour: 8, aircraft: 'Airbus A380' },
  { airlineCode: 'EK', origin: 'DXB', destination: 'SIN', basePriceBusiness: 2800, basePriceFirst: 7200, durationMin: 420, typicalDepartHour: 22, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'EK', origin: 'DXB', destination: 'SYD', basePriceBusiness: 5500, basePriceFirst: 14000, durationMin: 870, typicalDepartHour: 21, aircraft: 'Airbus A380' },
  { airlineCode: 'EK', origin: 'DXB', destination: 'CDG', basePriceBusiness: 3100, basePriceFirst: 8200, durationMin: 420, typicalDepartHour: 9, aircraft: 'Airbus A380' },
  // Qatar Airways
  { airlineCode: 'QR', origin: 'DOH', destination: 'JFK', basePriceBusiness: 4600, basePriceFirst: 12000, durationMin: 810, typicalDepartHour: 1, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'QR', origin: 'DOH', destination: 'LHR', basePriceBusiness: 3000, basePriceFirst: 8000, durationMin: 420, typicalDepartHour: 7, aircraft: 'Airbus A350-900' },
  { airlineCode: 'QR', origin: 'DOH', destination: 'SIN', basePriceBusiness: 2600, basePriceFirst: 6800, durationMin: 450, typicalDepartHour: 20, aircraft: 'Airbus A350-900' },
  { airlineCode: 'QR', origin: 'DOH', destination: 'SYD', basePriceBusiness: 5200, basePriceFirst: 13500, durationMin: 900, typicalDepartHour: 19, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'QR', origin: 'DOH', destination: 'NRT', basePriceBusiness: 3800, basePriceFirst: 10000, durationMin: 600, typicalDepartHour: 22, aircraft: 'Boeing 787-9 Dreamliner' },
  // Singapore Airlines
  { airlineCode: 'SQ', origin: 'SIN', destination: 'JFK', basePriceBusiness: 5200, basePriceFirst: 14500, durationMin: 1110, typicalDepartHour: 23, aircraft: 'Airbus A350-900' },
  { airlineCode: 'SQ', origin: 'SIN', destination: 'LHR', basePriceBusiness: 3400, basePriceFirst: 9000, durationMin: 780, typicalDepartHour: 10, aircraft: 'Airbus A380' },
  { airlineCode: 'SQ', origin: 'SIN', destination: 'SYD', basePriceBusiness: 2800, basePriceFirst: 7500, durationMin: 480, typicalDepartHour: 8, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'SQ', origin: 'SIN', destination: 'NRT', basePriceBusiness: 2500, basePriceFirst: 6500, durationMin: 420, typicalDepartHour: 9, aircraft: 'Airbus A380' },
  { airlineCode: 'SQ', origin: 'SIN', destination: 'FRA', basePriceBusiness: 3200, basePriceFirst: 8500, durationMin: 750, typicalDepartHour: 23, aircraft: 'Airbus A350-900' },
  // Cathay Pacific
  { airlineCode: 'CX', origin: 'HKG', destination: 'JFK', basePriceBusiness: 4200, basePriceFirst: 11000, durationMin: 960, typicalDepartHour: 0, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'CX', origin: 'HKG', destination: 'LHR', basePriceBusiness: 3500, basePriceFirst: 9200, durationMin: 720, typicalDepartHour: 23, aircraft: 'Airbus A350-900' },
  { airlineCode: 'CX', origin: 'HKG', destination: 'SYD', basePriceBusiness: 3000, basePriceFirst: 7800, durationMin: 540, typicalDepartHour: 18, aircraft: 'Airbus A350-900' },
  { airlineCode: 'CX', origin: 'HKG', destination: 'SFO', basePriceBusiness: 4000, basePriceFirst: 10500, durationMin: 720, typicalDepartHour: 15, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'CX', origin: 'HKG', destination: 'NRT', basePriceBusiness: 1800, basePriceFirst: 4800, durationMin: 240, typicalDepartHour: 9, aircraft: 'Airbus A330-300' },
  // ANA
  { airlineCode: 'NH', origin: 'NRT', destination: 'JFK', basePriceBusiness: 4500, basePriceFirst: 15000, durationMin: 780, typicalDepartHour: 17, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'NH', origin: 'NRT', destination: 'LAX', basePriceBusiness: 3800, basePriceFirst: 12500, durationMin: 600, typicalDepartHour: 18, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'NH', origin: 'NRT', destination: 'LHR', basePriceBusiness: 3500, basePriceFirst: 10500, durationMin: 720, typicalDepartHour: 11, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'NH', origin: 'NRT', destination: 'SFO', basePriceBusiness: 3600, basePriceFirst: 12000, durationMin: 570, typicalDepartHour: 16, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'NH', origin: 'NRT', destination: 'ORD', basePriceBusiness: 4200, basePriceFirst: 13000, durationMin: 720, typicalDepartHour: 17, aircraft: 'Boeing 777-300ER' },
  // Lufthansa
  { airlineCode: 'LH', origin: 'FRA', destination: 'JFK', basePriceBusiness: 3200, basePriceFirst: 9500, durationMin: 540, typicalDepartHour: 10, aircraft: 'Airbus A380' },
  { airlineCode: 'LH', origin: 'FRA', destination: 'LAX', basePriceBusiness: 3600, basePriceFirst: 10500, durationMin: 690, typicalDepartHour: 13, aircraft: 'Airbus A380' },
  { airlineCode: 'LH', origin: 'FRA', destination: 'SIN', basePriceBusiness: 3000, basePriceFirst: 8000, durationMin: 720, typicalDepartHour: 22, aircraft: 'Airbus A350-900' },
  { airlineCode: 'LH', origin: 'FRA', destination: 'NRT', basePriceBusiness: 3400, basePriceFirst: 9800, durationMin: 660, typicalDepartHour: 14, aircraft: 'Boeing 747-8' },
  { airlineCode: 'LH', origin: 'FRA', destination: 'ORD', basePriceBusiness: 3100, basePriceFirst: 9000, durationMin: 570, typicalDepartHour: 11, aircraft: 'Boeing 747-8' },
  // British Airways
  { airlineCode: 'BA', origin: 'LHR', destination: 'JFK', basePriceBusiness: 3000, basePriceFirst: 8500, durationMin: 480, typicalDepartHour: 8, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'BA', origin: 'LHR', destination: 'LAX', basePriceBusiness: 3400, basePriceFirst: 9500, durationMin: 660, typicalDepartHour: 10, aircraft: 'Airbus A380' },
  { airlineCode: 'BA', origin: 'LHR', destination: 'SIN', basePriceBusiness: 3100, basePriceFirst: 8200, durationMin: 780, typicalDepartHour: 21, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'BA', origin: 'LHR', destination: 'SYD', basePriceBusiness: 5000, basePriceFirst: 13000, durationMin: 1320, typicalDepartHour: 22, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'BA', origin: 'LHR', destination: 'HKG', basePriceBusiness: 3300, basePriceFirst: 8800, durationMin: 720, typicalDepartHour: 22, aircraft: 'Boeing 777-300ER' },
  // Etihad
  { airlineCode: 'EY', origin: 'AUH', destination: 'JFK', basePriceBusiness: 4500, basePriceFirst: 13000, durationMin: 840, typicalDepartHour: 2, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'EY', origin: 'AUH', destination: 'LHR', basePriceBusiness: 3000, basePriceFirst: 8000, durationMin: 450, typicalDepartHour: 8, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'EY', origin: 'AUH', destination: 'SYD', basePriceBusiness: 5000, basePriceFirst: 14500, durationMin: 870, typicalDepartHour: 22, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'EY', origin: 'AUH', destination: 'SIN', basePriceBusiness: 2500, basePriceFirst: 6500, durationMin: 420, typicalDepartHour: 21, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'EY', origin: 'AUH', destination: 'CDG', basePriceBusiness: 2800, basePriceFirst: 7500, durationMin: 420, typicalDepartHour: 9, aircraft: 'Airbus A350-900' },
  // Turkish Airlines
  { airlineCode: 'TK', origin: 'IST', destination: 'JFK', basePriceBusiness: 3200, basePriceFirst: 8500, durationMin: 660, typicalDepartHour: 1, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'TK', origin: 'IST', destination: 'LHR', basePriceBusiness: 1800, basePriceFirst: 4800, durationMin: 240, typicalDepartHour: 7, aircraft: 'Airbus A330-300' },
  { airlineCode: 'TK', origin: 'IST', destination: 'SIN', basePriceBusiness: 2800, basePriceFirst: 7200, durationMin: 600, typicalDepartHour: 22, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'TK', origin: 'IST', destination: 'SYD', basePriceBusiness: 4500, basePriceFirst: 11000, durationMin: 1200, typicalDepartHour: 20, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'TK', origin: 'IST', destination: 'LAX', basePriceBusiness: 3500, basePriceFirst: 9000, durationMin: 780, typicalDepartHour: 2, aircraft: 'Boeing 777-300ER' },
  // JAL
  { airlineCode: 'JL', origin: 'NRT', destination: 'JFK', basePriceBusiness: 4300, basePriceFirst: 14000, durationMin: 780, typicalDepartHour: 18, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'JL', origin: 'NRT', destination: 'LAX', basePriceBusiness: 3700, basePriceFirst: 12000, durationMin: 600, typicalDepartHour: 17, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'JL', origin: 'NRT', destination: 'LHR', basePriceBusiness: 3400, basePriceFirst: 10000, durationMin: 720, typicalDepartHour: 11, aircraft: 'Boeing 787-9 Dreamliner' },
  { airlineCode: 'JL', origin: 'NRT', destination: 'SFO', basePriceBusiness: 3500, basePriceFirst: 11500, durationMin: 570, typicalDepartHour: 16, aircraft: 'Boeing 777-300ER' },
  { airlineCode: 'JL', origin: 'NRT', destination: 'ORD', basePriceBusiness: 4000, basePriceFirst: 12500, durationMin: 720, typicalDepartHour: 18, aircraft: 'Boeing 787-9 Dreamliner' },
];

// Hub airports for connecting flights
const HUBS = ['DXB', 'DOH', 'SIN', 'LHR', 'FRA', 'IST', 'HKG', 'NRT'];

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

const findAirport = (code: string) => AIRPORTS.find((a) => a.code === code);

const findAirline = (code: string) => getAirlineByCode(code) || AIRLINES[0];

const getPriceMultiplier = (departureDate: string, rng: () => number): number => {
  const today = new Date();
  const dep = new Date(departureDate);
  const daysOut = Math.max(1, Math.floor((dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Advance purchase discount: sweet spot is 30-60 days out
  let multiplier = 1.0;
  if (daysOut < 7) multiplier = 1.35;
  else if (daysOut < 14) multiplier = 1.2;
  else if (daysOut < 30) multiplier = 1.05;
  else if (daysOut < 60) multiplier = 0.9;
  else if (daysOut < 90) multiplier = 0.95;
  else multiplier = 1.0;

  // Day of week: weekends are more expensive
  const dayOfWeek = dep.getDay();
  if (dayOfWeek === 5 || dayOfWeek === 0) multiplier *= 1.08;

  // Small random variation ±8%
  multiplier *= (0.92 + rng() * 0.16);

  return multiplier;
};

const generateRealisticSegment = (
  route: RouteData,
  departureDate: string,
  cabinClass: 'business' | 'first',
  rng: () => number,
): FlightSegment => {
  const airline = findAirline(route.airlineCode);
  const depHour = route.typicalDepartHour + randomBetween(-1, 1, rng);
  const depMin = randomBetween(0, 11, rng) * 5;
  const depDate = new Date(departureDate);
  depDate.setHours(((depHour % 24) + 24) % 24, depMin);

  const durationVariation = randomBetween(-15, 15, rng);
  const duration = route.durationMin + durationVariation;
  const arrDate = new Date(depDate.getTime() + duration * 60000);

  const amenityPool = cabinClass === 'first' ? FIRST_AMENITIES : BUSINESS_AMENITIES;
  const amenityCount = cabinClass === 'first' ? randomBetween(7, 10, rng) : randomBetween(5, 8, rng);
  const amenities = [...amenityPool].sort(() => rng() - 0.5).slice(0, amenityCount);

  const flightNum = randomBetween(100, 999, rng);

  return {
    id: generateId(),
    airline,
    flightNumber: `${route.airlineCode}${flightNum}`,
    aircraft: route.aircraft,
    departureAirport: findAirport(route.origin) || AIRPORTS[0],
    arrivalAirport: findAirport(route.destination) || AIRPORTS[1],
    departureTime: depDate.toISOString(),
    arrivalTime: arrDate.toISOString(),
    duration,
    cabinClass,
    amenities,
  };
};

const buildDirectFlight = (
  route: RouteData,
  query: SearchQuery,
  rng: () => number,
): Flight => {
  const cabinClass = query.cabinClass;
  const basePrice = cabinClass === 'first' ? route.basePriceFirst : route.basePriceBusiness;
  const priceMultiplier = getPriceMultiplier(query.departureDate, rng);
  const price = Math.round(basePrice * priceMultiplier);
  const originalPrice = Math.round(price * (1 + rng() * 0.15));

  const segment = generateRealisticSegment(route, query.departureDate, cabinClass, rng);

  return {
    id: generateId(),
    segments: [segment],
    totalDuration: segment.duration,
    stops: 0,
    price,
    originalPrice,
    currency: 'USD',
    cabinClass,
    seatsRemaining: randomBetween(1, 9, rng),
    bookingUrl: '#',
    fareRules: [
      'Free cancellation within 24 hours',
      cabinClass === 'first' ? 'Unlimited date changes' : 'One free date change',
      'Upgrade to First Class subject to availability',
    ],
    baggageAllowance: cabinClass === 'first' ? '3 x 32kg checked bags' : '2 x 32kg checked bags',
    refundable: rng() > 0.35,
    changeable: true,
    loungAccess: true,
  };
};

const buildConnectingFlight = (
  leg1: RouteData,
  leg2: RouteData,
  query: SearchQuery,
  rng: () => number,
): Flight => {
  const cabinClass = query.cabinClass;
  const basePrice1 = cabinClass === 'first' ? leg1.basePriceFirst : leg1.basePriceBusiness;
  const basePrice2 = cabinClass === 'first' ? leg2.basePriceFirst : leg2.basePriceBusiness;
  // Connecting flights are typically 15-30% cheaper than sum of legs
  const combinedBase = (basePrice1 + basePrice2) * (0.55 + rng() * 0.15);
  const priceMultiplier = getPriceMultiplier(query.departureDate, rng);
  const price = Math.round(combinedBase * priceMultiplier);
  const originalPrice = Math.round(price * (1 + rng() * 0.12));

  const seg1 = generateRealisticSegment(leg1, query.departureDate, cabinClass, rng);
  const layoverDuration = randomBetween(90, 240, rng);
  const seg2ArrivalTime = new Date(new Date(seg1.arrivalTime).getTime() + layoverDuration * 60000);
  const seg2DepartDate = seg2ArrivalTime.toISOString().split('T')[0];
  const seg2 = generateRealisticSegment(leg2, seg2DepartDate, cabinClass, rng);
  // Adjust seg2 departure to be after layover
  const correctedDep = new Date(new Date(seg1.arrivalTime).getTime() + layoverDuration * 60000);
  const correctedArr = new Date(correctedDep.getTime() + seg2.duration * 60000);
  seg2.departureTime = correctedDep.toISOString();
  seg2.arrivalTime = correctedArr.toISOString();

  const totalDuration = seg1.duration + layoverDuration + seg2.duration;
  const hubAirport = findAirport(leg1.destination) || AIRPORTS[0];

  const layoverInfo: LayoverInfo[] = [{
    airport: hubAirport,
    duration: layoverDuration,
    terminalChange: rng() > 0.75,
  }];

  return {
    id: generateId(),
    segments: [seg1, seg2],
    totalDuration,
    stops: 1,
    price,
    originalPrice,
    currency: 'USD',
    cabinClass,
    seatsRemaining: randomBetween(1, 7, rng),
    bookingUrl: '#',
    fareRules: [
      'Free cancellation within 24 hours',
      cabinClass === 'first' ? 'Unlimited date changes' : 'One free date change',
    ],
    baggageAllowance: cabinClass === 'first' ? '3 x 32kg checked bags' : '2 x 32kg checked bags',
    refundable: rng() > 0.4,
    changeable: true,
    loungAccess: true,
    layoverInfo,
  };
};

export const searchFlights = async (query: SearchQuery): Promise<Flight[]> => {
  // Try real APIs first, fall back to realistic mock data
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

    log.info('No real API results, falling back to realistic mock data');
  } catch (error) {
    log.warn('Aggregator failed, using realistic mock data', { error: (error as Error).message });
  }

  // Realistic mock data generation
  await new Promise((resolve) => setTimeout(resolve, 600));

  const originCode = query.origin!.code;
  const destCode = query.destination!.code;
  const seed = `${originCode}-${destCode}-${query.departureDate}-${query.cabinClass}`;
  const rng = seededRandom(seed);

  const flights: Flight[] = [];

  // 1. Find direct routes (both directions)
  const directRoutes = REAL_ROUTES.filter(
    (r) => (r.origin === originCode && r.destination === destCode) ||
           (r.origin === destCode && r.destination === originCode)
  );

  // Generate direct flights with slight variations per airline
  for (const route of directRoutes) {
    const adjustedRoute = route.origin === originCode ? route : {
      ...route,
      origin: route.destination,
      destination: route.origin,
      typicalDepartHour: (route.typicalDepartHour + 12) % 24,
    };
    // Generate 1-2 flights per airline (different times)
    flights.push(buildDirectFlight(adjustedRoute, query, rng));
    if (rng() > 0.4) {
      const altRoute = { ...adjustedRoute, typicalDepartHour: (adjustedRoute.typicalDepartHour + 8) % 24 };
      flights.push(buildDirectFlight(altRoute, query, rng));
    }
  }

  // 2. Find connecting flights through hubs
  for (const hub of HUBS) {
    if (hub === originCode || hub === destCode) continue;

    const leg1Options = REAL_ROUTES.filter(
      (r) => (r.origin === originCode && r.destination === hub) ||
             (r.destination === originCode && r.origin === hub)
    );
    const leg2Options = REAL_ROUTES.filter(
      (r) => (r.origin === hub && r.destination === destCode) ||
             (r.destination === hub && r.origin === destCode)
    );

    if (leg1Options.length > 0 && leg2Options.length > 0) {
      const leg1 = leg1Options[0];
      const leg2 = leg2Options[0];
      const adjustedLeg1 = leg1.origin === originCode ? leg1 : {
        ...leg1, origin: leg1.destination, destination: leg1.origin,
        typicalDepartHour: (leg1.typicalDepartHour + 12) % 24,
      };
      const adjustedLeg2 = leg2.origin === hub ? leg2 : {
        ...leg2, origin: leg2.destination, destination: leg2.origin,
        typicalDepartHour: (leg2.typicalDepartHour + 12) % 24,
      };

      flights.push(buildConnectingFlight(adjustedLeg1, adjustedLeg2, query, rng));
    }
  }

  // 3. If we still don't have enough flights, add some from nearby hubs
  if (flights.length < 5) {
    const fallbackRoutes = REAL_ROUTES.filter(
      (r) => r.origin === originCode || r.destination === originCode ||
             r.origin === destCode || r.destination === destCode
    ).slice(0, 6);

    for (const route of fallbackRoutes) {
      const adjustedRoute = {
        ...route,
        origin: originCode,
        destination: destCode,
        durationMin: route.durationMin + randomBetween(-60, 120, rng),
      };
      flights.push(buildDirectFlight(adjustedRoute, query, rng));
    }
  }

  return flights.sort((a, b) => a.price - b.price);
};

export const getCalendarPrices = async (
  origin: string,
  destination: string,
  cabinClass: 'business' | 'first',
  month: string
): Promise<CalendarPrice[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const seed = `calendar-${origin}-${destination}-${cabinClass}-${month}`;
  const rng = seededRandom(seed);

  // Find a matching route to base prices on
  const matchingRoute = REAL_ROUTES.find(
    (r) => (r.origin === origin && r.destination === destination) ||
           (r.origin === destination && r.destination === origin)
  );
  const basePrice = matchingRoute
    ? (cabinClass === 'first' ? matchingRoute.basePriceFirst : matchingRoute.basePriceBusiness)
    : (cabinClass === 'first' ? 8000 : 3500);

  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  const prices: CalendarPrice[] = [];
  let minPrice = Infinity;

  const tempPrices: { date: string; price: number; available: boolean }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const available = rng() > 0.1;
    const dayOfWeek = d.getDay();
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 0) ? 1.1 : 1.0;
    const variation = 0.85 + rng() * 0.3;
    const price = available ? Math.round(basePrice * weekendMultiplier * variation) : 0;

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
  await new Promise((resolve) => setTimeout(resolve, 300));

  const today = new Date();
  const seed = `deals-${today.toISOString().split('T')[0]}`;
  const rng = seededRandom(seed);

  const deals: DealOfDay[] = [];

  // Pick actual routes from our database for deals
  const dealRoutes = [...REAL_ROUTES]
    .sort(() => rng() - 0.5)
    .slice(0, 12);

  for (const route of dealRoutes) {
    const origin = findAirport(route.origin);
    const destination = findAirport(route.destination);
    if (!origin || !destination) continue;

    const cabinClass = rng() > 0.5 ? 'first' : 'business' as const;
    const originalPrice = cabinClass === 'first' ? route.basePriceFirst : route.basePriceBusiness;
    const discount = randomBetween(20, 45, rng);
    const price = Math.round(originalPrice * (1 - discount / 100));
    const airline = findAirline(route.airlineCode);

    const departDaysOut = randomBetween(14, 90, rng);
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
      returnDate: addDays(departDate, randomBetween(5, 14, rng)),
      expiresAt: addDays(today.toISOString().split('T')[0], randomBetween(1, 3, rng)),
      imageUrl: '',
    });
  }

  return deals.sort((a, b) => b.discount - a.discount);
};
