export type VisaRequirement = 'visa_free' | 'visa_on_arrival' | 'e_visa' | 'visa_required';

export interface VisaInfo {
  requirement: VisaRequirement;
  maxStay: string;
  notes: string;
}

const VISA_LABEL: Record<VisaRequirement, { label: string; color: string }> = {
  visa_free: { label: 'Visa Free', color: '#10B981' },
  visa_on_arrival: { label: 'Visa on Arrival', color: '#F59E0B' },
  e_visa: { label: 'e-Visa Required', color: '#3B82F6' },
  visa_required: { label: 'Visa Required', color: '#EF4444' },
};

export const getVisaLabel = (req: VisaRequirement) => VISA_LABEL[req];

// Simplified visa data: passport country -> destination country -> requirement
// This is a subset. Real app would use a comprehensive API.
const VISA_DATA: Record<string, Record<string, VisaInfo>> = {
  'United States': {
    'United Kingdom': { requirement: 'visa_free', maxStay: '6 months', notes: 'Electronic Travel Authorization (ETA) may be required' },
    France: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area, 90 days within 180-day period' },
    Germany: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    Japan: { requirement: 'visa_free', maxStay: '90 days', notes: 'Tourism purposes only' },
    Singapore: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    UAE: { requirement: 'visa_free', maxStay: '180 days', notes: '' },
    Qatar: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Thailand: { requirement: 'visa_free', maxStay: '30 days', notes: 'Extendable at immigration' },
    Australia: { requirement: 'e_visa', maxStay: '90 days', notes: 'ETA required before travel' },
    China: { requirement: 'visa_required', maxStay: 'Varies', notes: 'Apply at Chinese embassy/consulate. 144h transit visa-free for some cities.' },
    India: { requirement: 'e_visa', maxStay: '30-180 days', notes: 'e-Visa available online' },
    Brazil: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    'South Africa': { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Turkey: { requirement: 'e_visa', maxStay: '90 days', notes: 'e-Visa available at evisa.gov.tr' },
    'South Korea': { requirement: 'visa_free', maxStay: '90 days', notes: 'K-ETA may be required' },
    'Hong Kong': { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Netherlands: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    Switzerland: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    Italy: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    Spain: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    Malaysia: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    'New Zealand': { requirement: 'e_visa', maxStay: '90 days', notes: 'NZeTA required' },
    Kenya: { requirement: 'e_visa', maxStay: '90 days', notes: 'e-Visa at evisa.go.ke' },
    Egypt: { requirement: 'visa_on_arrival', maxStay: '30 days', notes: 'Single entry $25, Multiple $60' },
    Ethiopia: { requirement: 'e_visa', maxStay: '30-90 days', notes: 'e-Visa at evisa.gov.et' },
    Mexico: { requirement: 'visa_free', maxStay: '180 days', notes: '' },
    Colombia: { requirement: 'visa_free', maxStay: '90 days', notes: 'Extendable to 180 days' },
    Chile: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Argentina: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
  },
  'United Kingdom': {
    'United States': { requirement: 'e_visa', maxStay: '90 days', notes: 'ESTA required' },
    France: { requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen Area' },
    UAE: { requirement: 'visa_free', maxStay: '30 days', notes: '' },
    Japan: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Singapore: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
    Australia: { requirement: 'e_visa', maxStay: '90 days', notes: 'ETA required' },
    India: { requirement: 'e_visa', maxStay: '30-180 days', notes: 'e-Visa available' },
    Thailand: { requirement: 'visa_free', maxStay: '30 days', notes: '' },
    China: { requirement: 'visa_required', maxStay: 'Varies', notes: 'Apply at Chinese embassy' },
    Turkey: { requirement: 'visa_free', maxStay: '90 days', notes: '' },
  },
};

export const checkVisa = (passportCountry: string, destinationCountry: string): VisaInfo => {
  const countryData = VISA_DATA[passportCountry];
  if (!countryData) {
    return { requirement: 'visa_required', maxStay: 'Unknown', notes: 'Please check with the destination embassy for visa requirements.' };
  }
  return countryData[destinationCountry] || {
    requirement: 'visa_required',
    maxStay: 'Unknown',
    notes: 'Specific visa data not available. Check with the embassy.',
  };
};

export const PASSPORT_COUNTRIES = Object.keys(VISA_DATA);
export const DESTINATION_COUNTRIES = [...new Set(Object.values(VISA_DATA).flatMap(Object.keys))].sort();
