import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('Analytics');
const ANALYTICS_KEY = 'analytics_events';
const MAX_STORED_EVENTS = 500;

type EventName =
  | 'app_open'
  | 'search_performed'
  | 'flight_viewed'
  | 'deal_tapped'
  | 'alert_created'
  | 'alert_deleted'
  | 'favorite_added'
  | 'favorite_removed'
  | 'compare_viewed'
  | 'lounge_viewed'
  | 'visa_checked'
  | 'flight_tracked'
  | 'trip_created'
  | 'trip_item_added'
  | 'share_flight'
  | 'booking_started'
  | 'filter_applied'
  | 'sort_changed';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
}

let eventBuffer: AnalyticsEvent[] = [];

export const trackEvent = (name: EventName, properties?: Record<string, string | number | boolean>) => {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
  };

  eventBuffer.push(event);
  log.debug(`Event: ${name}`, properties);

  // Flush buffer periodically
  if (eventBuffer.length >= 10) {
    flushEvents();
  }
};

export const flushEvents = async () => {
  if (eventBuffer.length === 0) return;

  try {
    const existing = await AsyncStorage.getItem(ANALYTICS_KEY);
    const stored: AnalyticsEvent[] = existing ? JSON.parse(existing) : [];
    const combined = [...stored, ...eventBuffer].slice(-MAX_STORED_EVENTS);
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(combined));
    eventBuffer = [];
  } catch (error) {
    log.error('Failed to flush analytics', error);
  }
};

export const getAnalyticsSummary = async (): Promise<Record<string, number>> => {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_KEY);
    if (!data) return {};

    const events: AnalyticsEvent[] = JSON.parse(data);
    const summary: Record<string, number> = {};
    events.forEach((e) => {
      summary[e.name] = (summary[e.name] || 0) + 1;
    });
    return summary;
  } catch {
    return {};
  }
};

export const clearAnalytics = async () => {
  eventBuffer = [];
  await AsyncStorage.removeItem(ANALYTICS_KEY);
};

// Track common search properties
export const trackSearch = (cabinClass: string, origin: string, destination: string, passengers: number) => {
  trackEvent('search_performed', { cabinClass, origin, destination, passengers });
};

export const trackFlightView = (flightId: string, cabinClass: string, price: number) => {
  trackEvent('flight_viewed', { flightId, cabinClass, price });
};
