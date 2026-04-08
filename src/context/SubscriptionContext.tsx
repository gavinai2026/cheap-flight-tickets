import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionTier,
  SubscriptionPlan,
  SubscriptionState,
  DailyUsage,
  FREE_LIMITS,
  PLANS,
  PremiumFeatureKey,
} from '../types/subscription';

const STORAGE_KEY = 'subscription_state';

const getToday = (): string => new Date().toISOString().split('T')[0];

const initialUsage: DailyUsage = { searches: 0, date: getToday() };

const initialState: SubscriptionState = {
  tier: 'free',
  plan: null,
  expiresAt: null,
  startedAt: null,
  usageToday: initialUsage,
};

type SubAction =
  | { type: 'LOAD_STATE'; state: SubscriptionState }
  | { type: 'SUBSCRIBE'; plan: SubscriptionPlan }
  | { type: 'CANCEL' }
  | { type: 'SET_TIER'; tier: SubscriptionTier }
  | { type: 'INCREMENT_SEARCH' }
  | { type: 'RESET_DAILY_USAGE' };

function reducer(state: SubscriptionState, action: SubAction): SubscriptionState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;
    case 'SUBSCRIBE': {
      const now = new Date();
      const expiry = new Date(now);
      if (action.plan.interval === 'monthly') {
        expiry.setMonth(expiry.getMonth() + 1);
      } else {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }
      return {
        ...state,
        tier: 'premium',
        plan: action.plan,
        startedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
      };
    }
    case 'CANCEL':
      return { ...state, tier: 'free', plan: null, expiresAt: null, startedAt: null };
    case 'SET_TIER':
      return {
        ...state,
        tier: action.tier,
        plan: action.tier === 'free' ? null : state.plan,
        expiresAt: action.tier === 'free' ? null : state.expiresAt,
        startedAt: action.tier === 'free' ? null : state.startedAt,
      };
    case 'INCREMENT_SEARCH': {
      const today = getToday();
      const usage = state.usageToday.date === today
        ? { searches: state.usageToday.searches + 1, date: today }
        : { searches: 1, date: today };
      return { ...state, usageToday: usage };
    }
    case 'RESET_DAILY_USAGE':
      return { ...state, usageToday: { searches: 0, date: getToday() } };
    default:
      return state;
  }
}

interface SubscriptionContextType {
  state: SubscriptionState;
  isPremium: boolean;
  canSearch: () => boolean;
  canViewFullResults: () => boolean;
  canUsePremiumFeature: (feature: PremiumFeatureKey) => boolean;
  canAddFavorite: (currentCount: number) => boolean;
  canAddAlert: (currentCount: number) => boolean;
  getRemainingSearches: () => number;
  incrementSearchCount: () => void;
  subscribe: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  restorePurchase: () => void;
  toggleDevPremium: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data) as SubscriptionState;
        // Reset daily usage if it's a new day
        if (parsed.usageToday.date !== getToday()) {
          parsed.usageToday = { searches: 0, date: getToday() };
        }
        // Check if subscription has expired
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          parsed.tier = 'free';
          parsed.plan = null;
          parsed.expiresAt = null;
        }
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const isPremium = state.tier === 'premium';

  const canSearch = useCallback((): boolean => {
    if (isPremium) return true;
    const today = getToday();
    const searches = state.usageToday.date === today ? state.usageToday.searches : 0;
    return searches < FREE_LIMITS.maxSearchesPerDay;
  }, [isPremium, state.usageToday]);

  const canViewFullResults = useCallback((): boolean => isPremium, [isPremium]);

  const canUsePremiumFeature = useCallback(
    (_feature: PremiumFeatureKey): boolean => isPremium,
    [isPremium]
  );

  const canAddFavorite = useCallback(
    (currentCount: number): boolean => isPremium || currentCount < FREE_LIMITS.maxFavorites,
    [isPremium]
  );

  const canAddAlert = useCallback(
    (currentCount: number): boolean => isPremium || currentCount < FREE_LIMITS.maxAlerts,
    [isPremium]
  );

  const getRemainingSearches = useCallback((): number => {
    if (isPremium) return Infinity;
    const today = getToday();
    const searches = state.usageToday.date === today ? state.usageToday.searches : 0;
    return Math.max(0, FREE_LIMITS.maxSearchesPerDay - searches);
  }, [isPremium, state.usageToday]);

  const incrementSearchCount = useCallback(() => {
    dispatch({ type: 'INCREMENT_SEARCH' });
  }, []);

  const subscribe = useCallback((plan: SubscriptionPlan) => {
    // In production: trigger IAP purchase flow, validate receipt, then dispatch
    dispatch({ type: 'SUBSCRIBE', plan });
  }, []);

  const cancelSubscription = useCallback(() => {
    dispatch({ type: 'CANCEL' });
  }, []);

  const restorePurchase = useCallback(() => {
    // In production: call IAP restore, validate receipts, then dispatch
    // For now, no-op
  }, []);

  const toggleDevPremium = useCallback(() => {
    dispatch({ type: 'SET_TIER', tier: isPremium ? 'free' : 'premium' });
  }, [isPremium]);

  return (
    <SubscriptionContext.Provider
      value={{
        state,
        isPremium,
        canSearch,
        canViewFullResults,
        canUsePremiumFeature,
        canAddFavorite,
        canAddAlert,
        getRemainingSearches,
        incrementSearchCount,
        subscribe,
        cancelSubscription,
        restorePurchase,
        toggleDevPremium,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
};
