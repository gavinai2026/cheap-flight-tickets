import { Airport } from '../types';

export const AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', latitude: 33.9425, longitude: -118.4081 },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States', latitude: 41.9742, longitude: -87.9073 },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', latitude: 37.6213, longitude: -122.3790 },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', latitude: 25.7959, longitude: -80.2870 },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277 },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', latitude: 32.8998, longitude: -97.0403 },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States', latitude: 39.8561, longitude: -104.6737 },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', latitude: 47.4502, longitude: -122.3088 },
  { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States', latitude: 42.3656, longitude: -71.0096 },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'United States', latitude: 40.6895, longitude: -74.1745 },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington D.C.', country: 'United States', latitude: 38.9531, longitude: -77.4565 },

  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543 },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'United Kingdom', latitude: 51.1537, longitude: -0.1821 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622 },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3105, longitude: 4.7683 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', latitude: 40.4983, longitude: -3.5676 },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spain', latitude: 41.2974, longitude: 2.0833 },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', latitude: 41.8003, longitude: 12.2389 },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', latitude: 48.3537, longitude: 11.7750 },
  { code: 'ZRH', name: 'Zürich Airport', city: 'Zürich', country: 'Switzerland', latitude: 47.4647, longitude: 8.5492 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', latitude: 41.2753, longitude: 28.7519 },

  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', latitude: 25.2532, longitude: 55.3657 },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', latitude: 24.4330, longitude: 54.6511 },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', latitude: 25.2609, longitude: 51.6138 },

  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915 },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', latitude: 22.3080, longitude: 113.9185 },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', latitude: 35.7647, longitude: 140.3864 },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', latitude: 35.5494, longitude: 139.7798 },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', latitude: 37.4602, longitude: 126.4407 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', latitude: 13.6900, longitude: 100.7501 },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 2.7456, longitude: 101.7099 },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', latitude: 40.0799, longitude: 116.6031 },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', latitude: 31.1443, longitude: 121.8083 },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000 },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656 },

  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', latitude: -33.9461, longitude: 151.1772 },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', latitude: -37.6690, longitude: 144.8410 },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', latitude: -37.0082, longitude: 174.7850 },

  { code: 'GRU', name: 'São Paulo–Guarulhos International', city: 'São Paulo', country: 'Brazil', latitude: -23.4356, longitude: -46.4731 },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', latitude: -34.8222, longitude: -58.5358 },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', latitude: 19.4363, longitude: -99.0721 },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', latitude: -33.3930, longitude: -70.7858 },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', latitude: 4.7016, longitude: -74.1469 },

  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', latitude: -26.1392, longitude: 28.2460 },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', latitude: -33.9649, longitude: 18.6017 },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', latitude: 30.1219, longitude: 31.4056 },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', latitude: -1.3192, longitude: 36.9278 },
  { code: 'ADD', name: 'Bole International', city: 'Addis Ababa', country: 'Ethiopia', latitude: 8.9779, longitude: 38.7993 },
];

export const searchAirports = (query: string): Airport[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 10);
};
