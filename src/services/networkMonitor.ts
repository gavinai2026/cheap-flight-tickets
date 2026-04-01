import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { createLogger } from './logger';

const log = createLogger('NetworkMonitor');

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'offline';

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: string;
  quality: ConnectionQuality;
  isInternetReachable: boolean | null;
}

let currentStatus: NetworkStatus = {
  isConnected: true,
  connectionType: 'unknown',
  quality: 'good',
  isInternetReachable: true,
};

let subscription: NetInfoSubscription | null = null;
const listeners: Set<(status: NetworkStatus) => void> = new Set();

const assessQuality = (state: NetInfoState): ConnectionQuality => {
  if (!state.isConnected) return 'offline';
  if (state.isInternetReachable === false) return 'offline';

  if (state.type === 'wifi') return 'excellent';
  if (state.type === 'cellular') {
    const details = state.details as any;
    if (details?.cellularGeneration === '4g' || details?.cellularGeneration === '5g') return 'good';
    return 'poor';
  }
  return 'good';
};

const handleStateChange = (state: NetInfoState) => {
  const newStatus: NetworkStatus = {
    isConnected: state.isConnected ?? false,
    connectionType: state.type,
    quality: assessQuality(state),
    isInternetReachable: state.isInternetReachable,
  };

  const wasOffline = !currentStatus.isConnected;
  const isNowOnline = newStatus.isConnected;

  currentStatus = newStatus;

  if (wasOffline && isNowOnline) {
    log.info('Network connection restored', { type: state.type });
  } else if (!isNowOnline) {
    log.warn('Network connection lost');
  }

  listeners.forEach((fn) => fn(newStatus));
};

export const startMonitoring = () => {
  if (subscription) return;
  subscription = NetInfo.addEventListener(handleStateChange);
  log.info('Network monitoring started');
};

export const stopMonitoring = () => {
  subscription?.();
  subscription = null;
};

export const getNetworkStatus = (): NetworkStatus => currentStatus;

export const isOnline = (): boolean => currentStatus.isConnected;

export const subscribeToNetwork = (callback: (status: NetworkStatus) => void): (() => void) => {
  listeners.add(callback);
  callback(currentStatus);
  return () => listeners.delete(callback);
};

export const waitForConnection = (timeoutMs: number = 30000): Promise<boolean> => {
  if (currentStatus.isConnected) return Promise.resolve(true);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    const cleanup = subscribeToNetwork((status) => {
      if (status.isConnected) {
        clearTimeout(timeout);
        cleanup();
        resolve(true);
      }
    });
  });
};
