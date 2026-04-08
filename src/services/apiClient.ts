import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOnline } from './networkMonitor';
import { createLogger } from './logger';

const log = createLogger('ApiClient');

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cacheTTL?: number; // milliseconds, 0 = no cache
  cacheKey?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache
const memoryCache = new Map<string, CacheEntry<any>>();

// Inflight request deduplication
const inflightRequests = new Map<string, Promise<any>>();

// Circuit breaker per host
const circuitBreakers = new Map<string, { failures: number; openUntil: number }>();
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 60000;

const getCacheKey = (config: RequestConfig): string => {
  return config.cacheKey || `api_cache_${config.method || 'GET'}_${config.url}`;
};

const getFromMemoryCache = <T>(key: string): T | null => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
};

const setMemoryCache = <T>(key: string, data: T, ttl: number) => {
  memoryCache.set(key, { data, timestamp: Date.now(), ttl });
};

const getFromPersistentCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
};

const setPersistentCache = async <T>(key: string, data: T, ttl: number) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
  } catch {
    // Storage full, ignore
  }
};

const getHost = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const isCircuitOpen = (host: string): boolean => {
  const breaker = circuitBreakers.get(host);
  if (!breaker) return false;
  if (Date.now() > breaker.openUntil) {
    circuitBreakers.delete(host);
    return false;
  }
  return breaker.failures >= CIRCUIT_BREAKER_THRESHOLD;
};

const recordFailure = (host: string) => {
  const breaker = circuitBreakers.get(host) || { failures: 0, openUntil: 0 };
  breaker.failures += 1;
  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.openUntil = Date.now() + CIRCUIT_BREAKER_RESET_MS;
    log.warn(`Circuit breaker opened for ${host}`);
  }
  circuitBreakers.set(host, breaker);
};

const recordSuccess = (host: string) => {
  circuitBreakers.delete(host);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

export const apiRequest = async <T>(config: RequestConfig): Promise<T> => {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 15000,
    retries = 3,
    cacheTTL = 0,
  } = config;

  const cacheKey = getCacheKey(config);
  const host = getHost(url);

  // 1. Check memory cache
  if (cacheTTL > 0 && method === 'GET') {
    const memCached = getFromMemoryCache<T>(cacheKey);
    if (memCached) {
      log.debug('Memory cache hit', { url });
      return memCached;
    }
  }

  // 2. Check persistent cache
  if (cacheTTL > 0 && method === 'GET') {
    const persistCached = await getFromPersistentCache<T>(cacheKey);
    if (persistCached) {
      log.debug('Persistent cache hit', { url });
      setMemoryCache(cacheKey, persistCached, cacheTTL);
      return persistCached;
    }
  }

  // 3. Check offline
  if (!isOnline()) {
    throw new Error('No internet connection. Please check your network and try again.');
  }

  // 4. Check circuit breaker
  if (isCircuitOpen(host)) {
    throw new Error(`Service temporarily unavailable. Please try again later.`);
  }

  // 5. Request deduplication
  const dedupeKey = `${method}:${url}:${JSON.stringify(body || '')}`;
  if (inflightRequests.has(dedupeKey)) {
    log.debug('Deduplicating request', { url });
    return inflightRequests.get(dedupeKey)!;
  }

  // 6. Execute with retry
  const requestPromise = (async () => {
    let lastError: Error = new Error('Request failed');

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          log.debug(`Retry attempt ${attempt}/${retries} after ${backoff}ms`, { url });
          await delay(backoff);
        }

        const response = await fetchWithTimeout(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
          body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        }, timeout);

        if (!response.ok) {
          if (response.status === 429) {
            log.warn('Rate limited', { url, status: 429 });
            continue; // retry
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        recordSuccess(host);

        // Cache the result
        if (cacheTTL > 0 && method === 'GET') {
          setMemoryCache(cacheKey, data, cacheTTL);
          setPersistentCache(cacheKey, data, cacheTTL);
        }

        return data as T;
      } catch (error) {
        lastError = error as Error;
        if ((error as Error).name === 'AbortError') {
          lastError = new Error('Request timed out');
        }
        log.debug(`Request failed (attempt ${attempt + 1})`, { url, error: lastError.message });
      }
    }

    recordFailure(host);
    throw lastError;
  })();

  inflightRequests.set(dedupeKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inflightRequests.delete(dedupeKey);
  }
};

export const clearApiCache = async () => {
  memoryCache.clear();
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith('api_cache_'));
  for (const key of cacheKeys) {
    await AsyncStorage.removeItem(key);
  }
};
