export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type CabinClass = 'business' | 'first';
export type TripType = 'roundtrip' | 'oneway' | 'multicity';
export type SortOption = 'price_asc' | 'price_desc' | 'duration' | 'departure' | 'arrival' | 'stops';

export interface SearchQuery {
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  tripType: TripType;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  flexibleDates: boolean;
  preferredAirlines?: string[];
  maxStops?: number;
  maxPrice?: number;
}

export interface FlightSegment {
  id: string;
  airline: Airline;
  flightNumber: string;
  aircraft: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number; // minutes
  cabinClass: CabinClass;
  amenities: string[];
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  totalDuration: number;
  stops: number;
  price: number;
  originalPrice: number;
  currency: string;
  cabinClass: CabinClass;
  seatsRemaining: number;
  bookingUrl: string;
  fareRules: string[];
  baggageAllowance: string;
  refundable: boolean;
  changeable: boolean;
  loungAccess: boolean;
  layoverInfo?: LayoverInfo[];
}

export interface LayoverInfo {
  airport: Airport;
  duration: number;
  terminalChange: boolean;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
  alliance?: string;
}

export interface PriceAlert {
  id: string;
  searchQuery: SearchQuery;
  targetPrice: number;
  currentLowestPrice: number;
  isActive: boolean;
  createdAt: string;
  lastChecked: string;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface DealOfDay {
  id: string;
  origin: Airport;
  destination: Airport;
  cabinClass: CabinClass;
  price: number;
  originalPrice: number;
  discount: number;
  airline: Airline;
  departureDate: string;
  returnDate?: string;
  expiresAt: string;
  imageUrl: string;
}

export interface SavedSearch {
  id: string;
  query: SearchQuery;
  savedAt: string;
  lastPrice?: number;
  priceChange?: number;
}

export interface CalendarPrice {
  date: string;
  price: number;
  available: boolean;
  cheapest: boolean;
}

export interface UserPreferences {
  currency: string;
  homeAirport?: Airport;
  preferredAirlines: string[];
  preferredAlliance?: string;
  notifications: boolean;
  darkMode: boolean;
}
