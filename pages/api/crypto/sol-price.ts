import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Cache key for SOL price
const SOL_PRICE_CACHE_KEY = "crypto:sol:usd_price";
// Fallback price if API fails
const FALLBACK_SOL_PRICE = 150;
// Cache duration in seconds (1 hour)
const CACHE_DURATION = 60 * 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Try to get cached price first
    let price = await redis.get<number>(SOL_PRICE_CACHE_KEY);
    let fromCache = true;

    // If no cached price or force refresh requested
    if (!price || req.query.refresh === "true") {
      try {
        // Fetch fresh price from CoinGecko
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.solana && data.solana.usd) {
          price = data.solana.usd;
          fromCache = false;
          
          // Cache the price for 1 hour
          await redis.set(SOL_PRICE_CACHE_KEY, price, { ex: CACHE_DURATION });
          console.log("Updated SOL price cache:", price);
        } else {
          throw new Error("Invalid response format from CoinGecko");
        }
      } catch (error) {
        console.error("Error fetching SOL price:", error);
        
        // If we have a cached price, use it despite the error
        if (price) {
          console.log("Using existing cached price despite fetch error");
        } else {
          // If no cached price and fetch failed, use fallback
          price = FALLBACK_SOL_PRICE;
          fromCache = false;
          console.log("Using fallback SOL price:", price);
        }
      }
    }

    // Return the price with cache status
    return res.status(200).json({
      price,
      fromCache,
      timestamp: Date.now(),
      expiresIn: CACHE_DURATION,
    });
  } catch (error) {
    console.error("Error in SOL price API:", error);
    return res.status(500).json({ 
      error: "Failed to get SOL price",
      fallbackPrice: FALLBACK_SOL_PRICE
    });
  }
} 