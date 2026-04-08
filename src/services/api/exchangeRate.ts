import { apiRequest } from '../apiClient';
import { createLogger } from '../logger';
import { API_KEYS, API_URLS, isApiKeyConfigured } from '../../config/apiKeys';

const log = createLogger('ExchangeRateAPI');

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_utc: string;
}

let cachedRates: Record<string, number> | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export const getExchangeRates = async (baseCurrency: string = 'USD'): Promise<Record<string, number>> => {
  if (cachedRates && Date.now() - lastFetch < CACHE_DURATION) {
    return cachedRates;
  }

  if (!isApiKeyConfigured(API_KEYS.EXCHANGE_RATE_KEY)) {
    log.info('Exchange rate API not configured, using defaults');
    return getDefaultRates();
  }

  try {
    const response = await apiRequest<ExchangeRateResponse>({
      url: `${API_URLS.EXCHANGE_RATE_BASE}/${API_KEYS.EXCHANGE_RATE_KEY}/latest/${baseCurrency}`,
      cacheTTL: CACHE_DURATION,
      retries: 2,
    });

    cachedRates = response.conversion_rates;
    lastFetch = Date.now();
    log.info('Exchange rates updated', { base: baseCurrency, currencies: Object.keys(cachedRates).length });
    return cachedRates;
  } catch (error) {
    log.error('Failed to fetch exchange rates', error as Error);
    return getDefaultRates();
  }
};

export const convertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<number> => {
  if (from === to) return amount;

  const rates = await getExchangeRates(from);
  const rate = rates[to];

  if (!rate) {
    log.warn(`No exchange rate found for ${from} -> ${to}`);
    return amount;
  }

  return Math.round(amount * rate * 100) / 100;
};

export const formatCurrencyAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
};

const getDefaultRates = (): Record<string, number> => ({
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  SGD: 1.34,
  AED: 3.67,
  INR: 83.1,
  CNY: 7.24,
  KRW: 1320,
  THB: 35.5,
  MYR: 4.72,
  BRL: 4.97,
  MXN: 17.1,
  ZAR: 18.9,
  NZD: 1.67,
  HKD: 7.82,
  TRY: 30.2,
});

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '\u20A9' },
];
