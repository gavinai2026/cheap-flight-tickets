export interface Lounge {
  id: string;
  name: string;
  airportCode: string;
  terminal: string;
  airline?: string;
  alliance?: string;
  accessRules: string[];
  amenities: string[];
  rating: number;
  hours: string;
  location: string;
}

export const LOUNGES: Lounge[] = [
  // Dubai
  { id: 'l1', name: 'Emirates First Class Lounge', airportCode: 'DXB', terminal: 'T3', airline: 'EK', amenities: ['Spa & Shower', 'Fine Dining', 'Cigar Bar', 'Champagne Bar', 'Sleep Rooms', 'Shoe Shine'], accessRules: ['Emirates First Class', 'Emirates Skywards Platinum'], rating: 4.9, hours: '24 hours', location: 'Concourse A, Gate A1' },
  { id: 'l2', name: 'Emirates Business Class Lounge', airportCode: 'DXB', terminal: 'T3', airline: 'EK', amenities: ['Shower', 'Buffet Dining', 'Bar', 'Business Center', 'Kids Area'], accessRules: ['Emirates Business Class', 'Emirates Skywards Gold'], rating: 4.7, hours: '24 hours', location: 'Concourse B' },
  // Doha
  { id: 'l3', name: 'Al Mourjan Business Lounge', airportCode: 'DOH', terminal: 'Main', airline: 'QR', amenities: ['Spa', 'Fine Dining', 'Quiet Rooms', 'Family Area', 'Business Center', 'Shower', 'Game Room'], accessRules: ['Qatar Airways Business Class', 'oneworld Sapphire/Emerald'], rating: 4.9, hours: '24 hours', location: 'Near Gate B' },
  { id: 'l4', name: 'Al Safwa First Class Lounge', airportCode: 'DOH', terminal: 'Main', airline: 'QR', amenities: ['Private Suites', 'A la carte Dining', 'Spa', 'Jacuzzi', 'Quiet Rooms'], accessRules: ['Qatar Airways First Class', 'oneworld Emerald'], rating: 5.0, hours: '24 hours', location: 'Near Gate A' },
  // Singapore
  { id: 'l5', name: 'SilverKris First Class Lounge', airportCode: 'SIN', terminal: 'T3', airline: 'SQ', amenities: ['Fine Dining', 'Shower', 'Bar', 'Business Center'], accessRules: ['Singapore Airlines First Class', 'Star Alliance Gold'], rating: 4.8, hours: '24 hours', location: 'Terminal 3, Level 3' },
  { id: 'l6', name: 'The Private Room', airportCode: 'SIN', terminal: 'T3', airline: 'SQ', amenities: ['Personal Dining', 'Luxury Suites', 'Premium Bar', 'Concierge'], accessRules: ['Singapore Airlines Suites/First Class only'], rating: 5.0, hours: '24 hours', location: 'Terminal 3, Level 3' },
  // London Heathrow
  { id: 'l7', name: 'Concorde Room', airportCode: 'LHR', terminal: 'T5', airline: 'BA', amenities: ['A la carte Dining', 'Elemis Spa', 'Cabanas', 'Champagne Bar', 'Concierge'], accessRules: ['British Airways First Class', 'BA Gold Card'], rating: 4.8, hours: '05:00 - 22:00', location: 'Terminal 5, South Galleries' },
  { id: 'l8', name: 'Galleries First Lounge', airportCode: 'LHR', terminal: 'T5', airline: 'BA', amenities: ['Dining', 'Champagne Bar', 'Spa', 'Shower'], accessRules: ['BA First Class', 'oneworld Emerald'], rating: 4.6, hours: '05:00 - 22:30', location: 'Terminal 5' },
  { id: 'l9', name: 'Virgin Atlantic Clubhouse', airportCode: 'LHR', terminal: 'T3', airline: 'VS', amenities: ['A la carte Dining', 'Bar', 'Spa', 'Pool Table', 'Barber'], accessRules: ['Virgin Atlantic Upper Class', 'Virgin Gold'], rating: 4.8, hours: '05:30 - 22:00', location: 'Terminal 3' },
  // JFK
  { id: 'l10', name: 'Flagship First Dining', airportCode: 'JFK', terminal: 'T8', airline: 'AA', amenities: ['Fine Dining', 'Champagne', 'Premium Spirits'], accessRules: ['AA First Class (transcontinental/international)', 'ConciergeKey'], rating: 4.5, hours: '05:30 - 23:00', location: 'Terminal 8' },
  { id: 'l11', name: 'Polaris Lounge', airportCode: 'JFK', terminal: 'T7', airline: 'UA', amenities: ['Buffet & A la carte', 'Shower', 'Quiet Suite', 'Day Beds'], accessRules: ['United Polaris Business', 'Star Alliance Gold (international)'], rating: 4.6, hours: '05:30 - 23:00', location: 'Terminal 7' },
  // Hong Kong
  { id: 'l12', name: 'The Pier First Class Lounge', airportCode: 'HKG', terminal: 'T1', airline: 'CX', amenities: ['Day Suites', 'Shower Suites', 'Fine Dining', 'Bar', 'Foot Massage'], accessRules: ['Cathay Pacific First Class', 'oneworld Emerald'], rating: 4.9, hours: '05:30 - 00:30', location: 'Terminal 1, Gate 65' },
  { id: 'l13', name: 'The Pier Business Class Lounge', airportCode: 'HKG', terminal: 'T1', airline: 'CX', amenities: ['Noodle Bar', 'Shower', 'Relaxation Room', 'Bar'], accessRules: ['Cathay Pacific Business Class', 'oneworld Sapphire/Emerald'], rating: 4.7, hours: '05:30 - 00:30', location: 'Terminal 1, Gate 65' },
  // Frankfurt
  { id: 'l14', name: 'Lufthansa First Class Terminal', airportCode: 'FRA', terminal: 'T1', airline: 'LH', amenities: ['Personal Assistant', 'Fine Dining', 'Spa & Bath', 'Cigar Lounge', 'Chauffeur to Aircraft'], accessRules: ['Lufthansa First Class', 'HON Circle'], rating: 5.0, hours: '06:00 - 22:00', location: 'Separate Terminal near T1' },
  { id: 'l15', name: 'Lufthansa Business Lounge', airportCode: 'FRA', terminal: 'T1', airline: 'LH', amenities: ['Buffet', 'Bar', 'Shower', 'Sleeping Chairs'], accessRules: ['Lufthansa Business Class', 'Star Alliance Gold'], rating: 4.5, hours: '05:30 - 22:30', location: 'Terminal 1, Area B' },
  // Tokyo
  { id: 'l16', name: 'ANA Suite Lounge', airportCode: 'NRT', terminal: 'T1', airline: 'NH', amenities: ['Fine Dining', 'Sake Bar', 'Shower', 'Massage Chairs'], accessRules: ['ANA First Class', 'ANA Diamond'], rating: 4.7, hours: '07:00 - 21:00', location: 'Terminal 1, 4F' },
  { id: 'l17', name: 'JAL First Class Lounge', airportCode: 'NRT', terminal: 'T2', airline: 'JL', amenities: ['Sushi Bar', 'Sake Tasting', 'Shower', 'Massage'], accessRules: ['JAL First Class', 'JAL Diamond/JGC Premier'], rating: 4.8, hours: '07:30 - 21:00', location: 'Terminal 2, 3F' },
  // Abu Dhabi
  { id: 'l18', name: 'Etihad First Class Lounge', airportCode: 'AUH', terminal: 'T3', airline: 'EY', amenities: ['Six Senses Spa', 'Fine Dining', 'Cigar Lounge', 'Relaxation Room', 'Fitness Center'], accessRules: ['Etihad First Class', 'Etihad Guest Platinum'], rating: 4.9, hours: '24 hours', location: 'Terminal 3' },
  // Istanbul
  { id: 'l19', name: 'Turkish Airlines Lounge Istanbul', airportCode: 'IST', terminal: 'Main', airline: 'TK', amenities: ['Buffet', 'Cinema', 'Golf Simulator', 'Kids Zone', 'Shower', 'Billiards', 'Library'], accessRules: ['TK Business Class', 'Star Alliance Gold', 'Miles&Smiles Elite'], rating: 4.8, hours: '24 hours', location: 'International Departures' },
  // Sydney
  { id: 'l20', name: 'Qantas First Lounge', airportCode: 'SYD', terminal: 'T1', airline: 'QF', amenities: ['Neil Perry Restaurant', 'Aurora Spa', 'Bar', 'Shower'], accessRules: ['Qantas First Class', 'Qantas Platinum/Chairman'], rating: 4.8, hours: '05:00 - 22:30', location: 'Terminal 1, International' },
  // Priority Pass generic
  { id: 'l21', name: 'Plaza Premium Lounge', airportCode: 'LHR', terminal: 'T2', amenities: ['Buffet', 'Shower', 'Bar', 'Business Area'], accessRules: ['Priority Pass', 'Pay-per-visit ($50)'], rating: 4.0, hours: '05:00 - 22:00', location: 'Terminal 2' },
  { id: 'l22', name: 'Plaza Premium Lounge', airportCode: 'HKG', terminal: 'T1', amenities: ['Buffet', 'Shower', 'Nap Room', 'Bar'], accessRules: ['Priority Pass', 'Pay-per-visit ($45)'], rating: 4.1, hours: '24 hours', location: 'Terminal 1, East Hall' },
];

export const getLoungesByAirport = (code: string): Lounge[] =>
  LOUNGES.filter((l) => l.airportCode === code);

export const getLoungesForCabin = (code: string, cabinClass: 'business' | 'first'): Lounge[] =>
  LOUNGES.filter(
    (l) =>
      l.airportCode === code &&
      l.accessRules.some(
        (r) =>
          r.toLowerCase().includes(cabinClass) ||
          r.toLowerCase().includes('priority pass') ||
          (cabinClass === 'first' && r.toLowerCase().includes('emerald'))
      )
  );
