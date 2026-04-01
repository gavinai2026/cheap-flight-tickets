import { apiRequest } from '../apiClient';
import { createLogger } from '../logger';
import { API_KEYS, API_URLS, isApiKeyConfigured } from '../../config/apiKeys';

const log = createLogger('AviationStackAPI');

export interface FlightStatus {
  flightNumber: string;
  airline: string;
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted' | 'unknown';
  departure: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
  };
  arrival: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
  };
  aircraft: {
    registration: string | null;
    model: string | null;
  };
  live: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    speed: number | null;
    direction: number | null;
    updated: string | null;
    isGround: boolean;
  } | null;
}

interface AviationStackResponse {
  data: Array<{
    flight_date: string;
    flight_status: string;
    departure: {
      airport: string;
      iata: string;
      scheduled: string;
      estimated: string;
      actual: string | null;
      terminal: string | null;
      gate: string | null;
      delay: number | null;
    };
    arrival: {
      airport: string;
      iata: string;
      scheduled: string;
      estimated: string;
      actual: string | null;
      terminal: string | null;
      gate: string | null;
      delay: number | null;
    };
    airline: { name: string; iata: string };
    flight: { number: string; iata: string };
    aircraft: { registration: string | null; iata: string | null } | null;
    live: {
      latitude: number;
      longitude: number;
      altitude: number;
      speed: number;
      direction: number;
      updated: string;
      is_ground: boolean;
    } | null;
  }>;
}

export const getFlightStatus = async (flightIata: string): Promise<FlightStatus | null> => {
  if (!isApiKeyConfigured(API_KEYS.AVIATIONSTACK_KEY)) {
    log.info('AviationStack API not configured');
    return null;
  }

  try {
    const response = await apiRequest<AviationStackResponse>({
      url: `${API_URLS.AVIATIONSTACK_BASE}/flights?access_key=${API_KEYS.AVIATIONSTACK_KEY}&flight_iata=${flightIata}`,
      cacheTTL: 2 * 60 * 1000, // 2 min cache for live data
      retries: 1,
      timeout: 10000,
    });

    if (!response.data || response.data.length === 0) {
      log.info(`No flight data found for ${flightIata}`);
      return null;
    }

    const flight = response.data[0];

    return {
      flightNumber: flight.flight.iata,
      airline: flight.airline.name,
      status: (flight.flight_status as FlightStatus['status']) || 'unknown',
      departure: flight.departure,
      arrival: flight.arrival,
      aircraft: {
        registration: flight.aircraft?.registration || null,
        model: flight.aircraft?.iata || null,
      },
      live: flight.live
        ? {
            latitude: flight.live.latitude,
            longitude: flight.live.longitude,
            altitude: flight.live.altitude,
            speed: flight.live.speed,
            direction: flight.live.direction,
            updated: flight.live.updated,
            isGround: flight.live.is_ground,
          }
        : null,
    };
  } catch (error) {
    log.error('Flight status lookup failed', error as Error);
    return null;
  }
};

export const getFlightsByRoute = async (
  depIata: string,
  arrIata: string
): Promise<FlightStatus[]> => {
  if (!isApiKeyConfigured(API_KEYS.AVIATIONSTACK_KEY)) return [];

  try {
    const response = await apiRequest<AviationStackResponse>({
      url: `${API_URLS.AVIATIONSTACK_BASE}/flights?access_key=${API_KEYS.AVIATIONSTACK_KEY}&dep_iata=${depIata}&arr_iata=${arrIata}`,
      cacheTTL: 5 * 60 * 1000,
      retries: 1,
    });

    return (response.data || []).map((f) => ({
      flightNumber: f.flight.iata,
      airline: f.airline.name,
      status: (f.flight_status as FlightStatus['status']) || 'unknown',
      departure: f.departure,
      arrival: f.arrival,
      aircraft: { registration: f.aircraft?.registration || null, model: f.aircraft?.iata || null },
      live: f.live
        ? {
            latitude: f.live.latitude,
            longitude: f.live.longitude,
            altitude: f.live.altitude,
            speed: f.live.speed,
            direction: f.live.direction,
            updated: f.live.updated,
            isGround: f.live.is_ground,
          }
        : null,
    }));
  } catch {
    return [];
  }
};
