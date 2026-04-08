import { getAirlineByCode } from '../constants/airlines';
import { AIRPORTS } from '../constants/airports';
import { Airline, Airport } from '../types';

export interface FlightLookupResult {
  flightNumber: string;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  aircraft: string;
  estimatedPrice: number;
  currency: string;
}

interface FlightEntry {
  flightNumber: string;
  airlineCode: string;
  departureCode: string;
  arrivalCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  aircraft: string;
  estimatedPrice: number;
}

const FLIGHT_DATABASE: FlightEntry[] = [
  {
    flightNumber: 'EK201',
    airlineCode: 'EK',
    departureCode: 'JFK',
    arrivalCode: 'DXB',
    departureTime: '2026-04-15T23:15:00Z',
    arrivalTime: '2026-04-16T19:25:00Z',
    duration: 730,
    aircraft: 'Airbus A380-800',
    estimatedPrice: 4850,
  },
  {
    flightNumber: 'SQ25',
    airlineCode: 'SQ',
    departureCode: 'SIN',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T23:35:00Z',
    arrivalTime: '2026-04-16T06:00:00Z',
    duration: 1105,
    aircraft: 'Airbus A350-900ULR',
    estimatedPrice: 5200,
  },
  {
    flightNumber: 'BA117',
    airlineCode: 'BA',
    departureCode: 'JFK',
    arrivalCode: 'LHR',
    departureTime: '2026-04-15T19:00:00Z',
    arrivalTime: '2026-04-16T07:00:00Z',
    duration: 420,
    aircraft: 'Boeing 777-300ER',
    estimatedPrice: 3900,
  },
  {
    flightNumber: 'QR701',
    airlineCode: 'QR',
    departureCode: 'DOH',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T08:15:00Z',
    arrivalTime: '2026-04-15T15:30:00Z',
    duration: 795,
    aircraft: 'Boeing 777-300ER',
    estimatedPrice: 4600,
  },
  {
    flightNumber: 'CX840',
    airlineCode: 'CX',
    departureCode: 'HKG',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T00:05:00Z',
    arrivalTime: '2026-04-15T04:10:00Z',
    duration: 965,
    aircraft: 'Airbus A350-1000',
    estimatedPrice: 4200,
  },
  {
    flightNumber: 'NH110',
    airlineCode: 'NH',
    departureCode: 'NRT',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T17:05:00Z',
    arrivalTime: '2026-04-15T16:30:00Z',
    duration: 775,
    aircraft: 'Boeing 777-300ER',
    estimatedPrice: 5100,
  },
  {
    flightNumber: 'EK215',
    airlineCode: 'EK',
    departureCode: 'DXB',
    arrivalCode: 'LAX',
    departureTime: '2026-04-15T08:30:00Z',
    arrivalTime: '2026-04-15T13:15:00Z',
    duration: 985,
    aircraft: 'Airbus A380-800',
    estimatedPrice: 5500,
  },
  {
    flightNumber: 'SQ321',
    airlineCode: 'SQ',
    departureCode: 'SIN',
    arrivalCode: 'LHR',
    departureTime: '2026-04-15T02:25:00Z',
    arrivalTime: '2026-04-15T08:35:00Z',
    duration: 790,
    aircraft: 'Airbus A380-800',
    estimatedPrice: 4700,
  },
  {
    flightNumber: 'LH400',
    airlineCode: 'LH',
    departureCode: 'FRA',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T10:25:00Z',
    arrivalTime: '2026-04-15T13:05:00Z',
    duration: 520,
    aircraft: 'Boeing 747-8',
    estimatedPrice: 3800,
  },
  {
    flightNumber: 'TK1',
    airlineCode: 'TK',
    departureCode: 'IST',
    arrivalCode: 'JFK',
    departureTime: '2026-04-15T12:15:00Z',
    arrivalTime: '2026-04-15T16:10:00Z',
    duration: 655,
    aircraft: 'Boeing 787-9',
    estimatedPrice: 3400,
  },
];

const findAirport = (code: string): Airport | undefined =>
  AIRPORTS.find((a) => a.code === code);

export const lookupFlightByNumber = async (
  flightNumber: string
): Promise<{ result?: FlightLookupResult; error?: string; airline?: Airline }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const normalized = flightNumber.trim().toUpperCase();
  const entry = FLIGHT_DATABASE.find((f) => f.flightNumber === normalized);

  if (entry) {
    const airline = getAirlineByCode(entry.airlineCode);
    const dep = findAirport(entry.departureCode);
    const arr = findAirport(entry.arrivalCode);

    if (airline && dep && arr) {
      return {
        result: {
          flightNumber: entry.flightNumber,
          airline,
          departureAirport: dep,
          arrivalAirport: arr,
          departureTime: entry.departureTime,
          arrivalTime: entry.arrivalTime,
          duration: entry.duration,
          aircraft: entry.aircraft,
          estimatedPrice: entry.estimatedPrice,
          currency: 'USD',
        },
      };
    }
  }

  // Try to identify the airline from the prefix
  const airlineCodeMatch = normalized.match(/^([A-Z]{2})/);
  const recognizedAirline = airlineCodeMatch
    ? getAirlineByCode(airlineCodeMatch[1])
    : undefined;

  return {
    error: `Flight ${normalized} was not found. Please check the flight number and try again.`,
    airline: recognizedAirline,
  };
};

export const getFlightSuggestions = (query: string): string[] => {
  if (!query || query.length === 0) return [];
  const normalized = query.trim().toUpperCase();
  return FLIGHT_DATABASE
    .filter((f) => f.flightNumber.startsWith(normalized))
    .map((f) => f.flightNumber)
    .slice(0, 5);
};
