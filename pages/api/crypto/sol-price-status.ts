import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Cache key for SOL price
const SOL_PRICE_CACHE_KEY = "crypto:sol:usd_price";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the cached price
    const price = await redis.get<number>(SOL_PRICE_CACHE_KEY);
    
    // Get the TTL (time-to-live) for the cache key
    const ttl = await redis.ttl(SOL_PRICE_CACHE_KEY);
    
    return res.status(200).json({
      cacheExists: price !== null,
      currentPrice: price,
      ttlSeconds: ttl,
      expiresIn: ttl > 0 ? `${Math.floor(ttl / 60)} minutes and ${ttl % 60} seconds` : "expired or not set",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error checking SOL price cache status:", error);
    return res.status(500).json({ error: "Failed to check SOL price cache status" });
  }
} 