import { Redis } from "@upstash/redis";

// Initialize Redis client
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Cache keys
export const getPageCacheKey = (slug: string) => `page:${slug}`;

// Cache TTL in seconds (1 hour)
export const CACHE_TTL = 60 * 60;

// Cache page data
export async function cachePageData(slug: string, data: any) {
  const key = getPageCacheKey(slug);
  await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL });
}

// Get cached page data
export async function getCachedPageData(slug: string) {
  const key = getPageCacheKey(slug);
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData as string) : null;
}

// Invalidate page cache
export async function invalidatePageCache(slug: string) {
  const key = getPageCacheKey(slug);
  await redis.del(key);
} 