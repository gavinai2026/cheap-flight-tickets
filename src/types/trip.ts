export type TripItemType = 'flight' | 'hotel' | 'transport' | 'activity' | 'note';

export interface TripItem {
  id: string;
  type: TripItemType;
  title: string;
  subtitle?: string;
  startTime?: string; // ISO date string
  endTime?: string;
  location?: string;
  confirmationCode?: string;
  notes?: string;
  cost?: number;
  currency?: string;
}

export interface TripDay {
  date: string; // YYYY-MM-DD
  items: TripItem[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  days: TripDay[];
  totalBudget?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
