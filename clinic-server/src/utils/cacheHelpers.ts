// src/utils/cacheHelpers.ts
import redis from "./redisClient";

// Cache for 1 minute by default
const DEFAULT_TTL = 60; // seconds

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const fresh = await fetchFn();
  await redis.set(key, JSON.stringify(fresh), "EX", ttl);
  return fresh;
}

export async function invalidateCache(key: string) {
  await redis.del(key);
}
