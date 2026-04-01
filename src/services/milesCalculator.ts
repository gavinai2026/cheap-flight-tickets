import { Airport, CabinClass } from '../types';

export interface MilesEstimate {
  baseMiles: number;
  cabinBonusMiles: number;
  totalMiles: number;
  eliteQualifyingMiles: number;
  estimatedValue: number; // USD value of miles
  loyaltyProgram: string;
}

// Great circle distance calculation (Haversine formula)
const calculateDistance = (origin: Airport, destination: Airport): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.latitude * Math.PI) / 180) *
      Math.cos((destination.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Cabin class earning multipliers by airline alliance
const CABIN_MULTIPLIERS: Record<string, Record<CabinClass, number>> = {
  'Star Alliance': { business: 1.5, first: 3.0 },
  oneworld: { business: 1.5, first: 3.0 },
  SkyTeam: { business: 1.75, first: 3.0 },
  default: { business: 1.5, first: 2.5 },
};

// Loyalty program earning rates and value per mile (cents)
export const LOYALTY_PROGRAMS: Record<
  string,
  { name: string; earnRate: number; valuePerMile: number; alliance: string }
> = {
  EK: { name: 'Emirates Skywards', earnRate: 1.0, valuePerMile: 1.2, alliance: '' },
  QR: { name: 'Qatar Avios', earnRate: 1.0, valuePerMile: 1.4, alliance: 'oneworld' },
  SQ: { name: 'KrisFlyer', earnRate: 1.0, valuePerMile: 1.5, alliance: 'Star Alliance' },
  CX: { name: 'Asia Miles', earnRate: 1.0, valuePerMile: 1.3, alliance: 'oneworld' },
  EY: { name: 'Etihad Guest', earnRate: 1.0, valuePerMile: 1.1, alliance: '' },
  LH: { name: 'Miles & More', earnRate: 1.0, valuePerMile: 1.0, alliance: 'Star Alliance' },
  BA: { name: 'Avios', earnRate: 1.0, valuePerMile: 1.4, alliance: 'oneworld' },
  AF: { name: 'Flying Blue', earnRate: 1.0, valuePerMile: 1.2, alliance: 'SkyTeam' },
  AA: { name: 'AAdvantage', earnRate: 1.0, valuePerMile: 1.3, alliance: 'oneworld' },
  UA: { name: 'MileagePlus', earnRate: 1.0, valuePerMile: 1.2, alliance: 'Star Alliance' },
  DL: { name: 'SkyMiles', earnRate: 1.0, valuePerMile: 1.1, alliance: 'SkyTeam' },
  QF: { name: 'Qantas Frequent Flyer', earnRate: 1.0, valuePerMile: 1.4, alliance: 'oneworld' },
  NH: { name: 'ANA Mileage Club', earnRate: 1.0, valuePerMile: 1.5, alliance: 'Star Alliance' },
  JL: { name: 'JAL Mileage Bank', earnRate: 1.0, valuePerMile: 1.4, alliance: 'oneworld' },
  TK: { name: 'Miles&Smiles', earnRate: 1.0, valuePerMile: 1.3, alliance: 'Star Alliance' },
  AC: { name: 'Aeroplan', earnRate: 1.0, valuePerMile: 1.5, alliance: 'Star Alliance' },
  KE: { name: 'SKYPASS', earnRate: 1.0, valuePerMile: 1.2, alliance: 'SkyTeam' },
  VS: { name: 'Virgin Points', earnRate: 1.0, valuePerMile: 1.3, alliance: 'SkyTeam' },
  ET: { name: 'ShebaMiles', earnRate: 1.0, valuePerMile: 0.8, alliance: 'Star Alliance' },
  AI: { name: 'Flying Returns', earnRate: 1.0, valuePerMile: 0.7, alliance: 'Star Alliance' },
};

export const calculateMiles = (
  origin: Airport,
  destination: Airport,
  cabinClass: CabinClass,
  airlineCode: string,
  alliance?: string
): MilesEstimate => {
  const distance = calculateDistance(origin, destination);
  const baseMiles = Math.max(distance, 500); // Minimum 500 miles

  const allianceKey = alliance || 'default';
  const multipliers = CABIN_MULTIPLIERS[allianceKey] || CABIN_MULTIPLIERS.default;
  const cabinMultiplier = multipliers[cabinClass];

  const program = LOYALTY_PROGRAMS[airlineCode];
  const earnRate = program?.earnRate || 1.0;

  const cabinBonusMiles = Math.round(baseMiles * (cabinMultiplier - 1) * earnRate);
  const totalMiles = Math.round(baseMiles * cabinMultiplier * earnRate);
  const eliteQualifyingMiles = Math.round(baseMiles * Math.min(cabinMultiplier, 2.0));

  const valuePerMile = program?.valuePerMile || 1.0;
  const estimatedValue = Math.round((totalMiles * valuePerMile) / 100 * 100) / 100;

  return {
    baseMiles,
    cabinBonusMiles,
    totalMiles,
    eliteQualifyingMiles,
    estimatedValue,
    loyaltyProgram: program?.name || 'Airline Miles',
  };
};

export const getDistanceBetweenAirports = calculateDistance;
