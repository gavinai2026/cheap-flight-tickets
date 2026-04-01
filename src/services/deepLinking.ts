import { Linking } from 'react-native';
import { createLogger } from './logger';

const log = createLogger('DeepLinking');

const APP_SCHEME = 'premiumflights';

export const generateFlightLink = (flightId: string): string => {
  return `${APP_SCHEME}://flight/${flightId}`;
};

export const generateDealLink = (dealId: string): string => {
  return `${APP_SCHEME}://deal/${dealId}`;
};

export const generateSearchLink = (origin: string, destination: string, cabin: string): string => {
  return `${APP_SCHEME}://search?from=${origin}&to=${destination}&cabin=${cabin}`;
};

export interface DeepLinkData {
  type: 'flight' | 'deal' | 'search' | 'unknown';
  id?: string;
  params?: Record<string, string>;
}

export const parseDeepLink = (url: string): DeepLinkData => {
  try {
    if (!url.startsWith(APP_SCHEME)) {
      return { type: 'unknown' };
    }

    const path = url.replace(`${APP_SCHEME}://`, '');
    const [route, queryString] = path.split('?');
    const segments = route.split('/');

    const params: Record<string, string> = {};
    if (queryString) {
      queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    switch (segments[0]) {
      case 'flight':
        return { type: 'flight', id: segments[1], params };
      case 'deal':
        return { type: 'deal', id: segments[1], params };
      case 'search':
        return { type: 'search', params };
      default:
        return { type: 'unknown', params };
    }
  } catch (error) {
    log.error('Failed to parse deep link', error);
    return { type: 'unknown' };
  }
};

export const setupDeepLinkListener = (
  handler: (data: DeepLinkData) => void
): (() => void) => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    const data = parseDeepLink(url);
    handler(data);
  });

  // Check for initial URL
  Linking.getInitialURL().then((url) => {
    if (url) {
      const data = parseDeepLink(url);
      handler(data);
    }
  });

  return () => subscription.remove();
};
