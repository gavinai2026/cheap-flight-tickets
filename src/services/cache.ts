import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('Cache');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Memory cache with LRU-like eviction
const memoryCache = new Map<string, CacheEntry<any>>();
const MAX_MEMORY_ENTRIES = 100;

const evictOldest = () => {
  if (memoryCache.size < MAX_MEMORY_ENTRIES) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  memoryCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      oldestKey = key;
    }
  });
  if (oldestKey) memoryCache.delete(oldestKey);
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  // Check memory first
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (Date.now() - memEntry.timestamp <= memEntry.ttl) {
      return memEntry.data;
    }
    memoryCache.delete(key);
  }

  // Check persistent
  try {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }
    // Promote to memory
    memoryCache.set(key, entry);
    return entry.data;
  } catch {
    return null;
  }
};

export const cacheSet = async <T>(key: string, data: T, ttlMs: number, persistToo: boolean = true) => {
  evictOldest();
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
  memoryCache.set(key, entry);

  if (persistToo) {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch {
      log.warn('Failed to persist cache entry', { key });
    }
  }
};

export const cacheRemove = async (key: string) => {
  memoryCache.delete(key);
  try {
    await AsyncStorage.removeItem(`cache_${key}`);
  } catch {}
};

export const cacheClear = async () => {
  memoryCache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith('cache_'));
    for (const key of cacheKeys) await AsyncStorage.removeItem(key);
    log.info(`Cleared ${cacheKeys.length} cache entries`);
  } catch {}
};

// Stale-while-revalidate pattern
export const cacheGetOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  staleTTLMs?: number
): Promise<T> => {
  const cached = await cacheGet<T>(key);

  if (cached !== null) {
    // Check if stale but still usable
    const entry = memoryCache.get(key);
    if (entry && staleTTLMs && Date.now() - entry.timestamp > entry.ttl) {
      // Stale - return cached but refetch in background
      fetcher()
        .then((data) => cacheSet(key, data, ttlMs))
        .catch(() => {});
    }
    return cached;
  }

  const data = await fetcher();
  await cacheSet(key, data, ttlMs);
  return data;
};
