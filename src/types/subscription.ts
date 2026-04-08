export type SubscriptionTier = 'free' | 'premium';
export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: BillingInterval;
  tier: SubscriptionTier;
  trialDays: number;
  savings?: string;
}

export interface DailyUsage {
  searches: number;
  date: string; // YYYY-MM-DD
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  plan: SubscriptionPlan | null;
  expiresAt: string | null; // ISO date
  startedAt: string | null;
  usageToday: DailyUsage;
}

export const FREE_LIMITS = {
  maxSearchesPerDay: 5,
  maxResults: 5,
  maxFavorites: 3,
  maxAlerts: 1,
} as const;

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'monthly',
    tier: 'premium',
    trialDays: 7,
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 79.99,
    interval: 'yearly',
    tier: 'premium',
    trialDays: 7,
    savings: 'Save 33%',
  },
];

export const PREMIUM_FEATURES = [
  { key: 'unlimited_searches', label: 'Unlimited flight searches', freeValue: '5/day', premiumValue: 'Unlimited' },
  { key: 'full_results', label: 'Full search results', freeValue: '5 results', premiumValue: 'All results' },
  { key: 'price_prediction', label: 'Price prediction & trends', freeValue: false, premiumValue: true },
  { key: 'miles_calculator', label: 'Miles & points calculator', freeValue: false, premiumValue: true },
  { key: 'cabin_compare', label: 'Business vs First comparison', freeValue: false, premiumValue: true },
  { key: 'lounge_finder', label: 'Airport lounge finder', freeValue: false, premiumValue: true },
  { key: 'visa_checker', label: 'Visa requirements checker', freeValue: false, premiumValue: true },
  { key: 'flight_tracker', label: 'Real-time flight tracker', freeValue: false, premiumValue: true },
  { key: 'trip_planner', label: 'Trip planner', freeValue: false, premiumValue: true },
  { key: 'unlimited_favorites', label: 'Saved favorites', freeValue: '3 max', premiumValue: 'Unlimited' },
  { key: 'unlimited_alerts', label: 'Price alerts', freeValue: '1 max', premiumValue: 'Unlimited' },
] as const;

export type PremiumFeatureKey = typeof PREMIUM_FEATURES[number]['key'];
