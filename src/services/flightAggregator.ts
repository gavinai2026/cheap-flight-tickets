import { Flight, SearchQuery } from '../types';
import { searchAmadeusFlights } from './api/amadeus';
import { searchSkyscannerFlights } from './api/skyscanner';
import { createLogger } from './logger';
import { isOnline } from './networkMonitor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const log = createLogger('FlightAggregator');

const CACHE_KEY_PREFIX = 'flight_results_';

interface AggregatorResult {
  flights: Flight[];
  sources: string[];
  fromCache: boolean;
  errors: string[];
}

const getCacheKey = (query: SearchQuery): string => {
  return `${CACHE_KEY_PREFIX}${query.origin?.code}_${query.destination?.code}_${query.departureDate}_${query.cabinClass}`;
};

const deduplicateFlights = (flights: Flight[]): Flight[] => {
  const seen = new Map<string, Flight>();

  for (const flight of flights) {
    // Create a dedup key based on route, timing, and price
    const key = flight.segments
      .map((s) => `${s.departureAirport.code}-${s.arrivalAirport.code}-${s.flightNumber}`)
      .join('|');

    const existing = seen.get(key);
    if (!existing || flight.price < existing.price) {
      seen.set(key, flight);
    }
  }

  return Array.from(seen.values());
};

export const aggregateFlightSearch = async (query: SearchQuery): Promise<AggregatorResult> => {
  if (!query.origin || !query.destination) {
    return { flights: [], sources: [], fromCache: false, errors: ['Origin and destination required'] };
  }

  const cacheKey = getCacheKey(query);

  // If offline, try cache
  if (!isOnline()) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        log.info('Returning cached results (offline)');
        return { flights: data.flights, sources: data.sources, fromCache: true, errors: [] };
      }
    } catch {}
    return { flights: [], sources: [], fromCache: false, errors: ['No internet connection'] };
  }

  // Search all APIs in parallel
  const sources: string[] = [];
  const errors: string[] = [];

  const results = await Promise.allSettled([
    searchAmadeusFlights(query).then((flights) => {
      if (flights.length > 0) sources.push('Amadeus');
      return flights;
    }),
    searchSkyscannerFlights(query).then((flights) => {
      if (flights.length > 0) sources.push('Skyscanner');
      return flights;
    }),
  ]);

  let allFlights: Flight[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allFlights = allFlights.concat(result.value);
    } else {
      errors.push(result.reason?.message || 'Unknown API error');
      log.warn('API source failed', { error: result.reason?.message });
    }
  }

  // Deduplicate
  allFlights = deduplicateFlights(allFlights);

  // Sort by price
  allFlights.sort((a, b) => a.price - b.price);

  // Cache results
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ flights: allFlights, sources, timestamp: Date.now() }));
  } catch {}

  log.info(`Aggregated ${allFlights.length} flights from ${sources.length} sources`, {
    sources,
    totalResults: allFlights.length,
  });

  return { flights: allFlights, sources, fromCache: false, errors };
};
