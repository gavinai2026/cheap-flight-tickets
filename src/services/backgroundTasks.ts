import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('BackgroundTasks');
const LAST_CHECK_KEY = 'bg_last_price_check';

// Background task for price monitoring
// Note: expo-task-manager and expo-background-fetch are required for production use.
// In development, we use a simulated check mechanism.

export interface PriceCheckResult {
  alertId: string;
  route: string;
  previousPrice: number;
  currentPrice: number;
  dropped: boolean;
}

export const checkPricesForAlerts = async (): Promise<PriceCheckResult[]> => {
  try {
    const alertsJson = await AsyncStorage.getItem('price_alerts');
    if (!alertsJson) return [];

    const alerts = JSON.parse(alertsJson);
    const results: PriceCheckResult[] = [];

    for (const alert of alerts) {
      if (!alert.isActive) continue;

      // Simulate price check (in production, this would call the flight aggregator)
      const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const currentPrice = alert.targetPrice * (1 + priceVariation);
      const dropped = currentPrice <= alert.targetPrice;

      results.push({
        alertId: alert.id,
        route: alert.route || 'Unknown Route',
        previousPrice: alert.targetPrice,
        currentPrice: Math.round(currentPrice),
        dropped,
      });
    }

    await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
    log.info(`Checked ${results.length} alerts, ${results.filter(r => r.dropped).length} price drops`);
    return results;
  } catch (error) {
    log.error('Background price check failed', error);
    return [];
  }
};

export const getLastCheckTime = async (): Promise<string | null> => {
  return AsyncStorage.getItem(LAST_CHECK_KEY);
};

// Register background task (requires expo-task-manager in production)
export const registerBackgroundPriceCheck = async () => {
  try {
    // In production, use:
    // import * as TaskManager from 'expo-task-manager';
    // import * as BackgroundFetch from 'expo-background-fetch';
    // TaskManager.defineTask(TASK_NAME, async () => { ... });
    // await BackgroundFetch.registerTaskAsync(TASK_NAME, { minimumInterval: 15 * 60 });
    log.info('Background price check registered (simulated in dev)');
  } catch (error) {
    log.error('Failed to register background task', error);
  }
};

export const unregisterBackgroundPriceCheck = async () => {
  try {
    log.info('Background price check unregistered');
  } catch (error) {
    log.error('Failed to unregister background task', error);
  }
};
