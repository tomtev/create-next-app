import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Cache keys and durations
const getTokenCacheKey = (walletAddress: string) => `tokens:${walletAddress}`;
const getRateLimitKey = (walletAddress: string) => `ratelimit:tokens:${walletAddress}`;
const CACHE_DURATION = 15; // 15 seconds cache
const RATE_LIMIT_DURATION = 3; // 3 seconds between requests (reduced from 5)
const RATE_LIMIT_REQUESTS = 3; // Allow 3 requests per RATE_LIMIT_DURATION (increased from 1)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  if (!HELIUS_API_KEY) {
    console.error('Missing Helius API key');
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // Check for rate limiting unless explicitly bypassed
    if (req.query.bypass !== 'true') {
      const rateLimitKey = getRateLimitKey(walletAddress);
      const requestCount = await redis.get<number>(rateLimitKey) || 0;
      
      if (requestCount >= RATE_LIMIT_REQUESTS) {
        console.log(`Rate limit exceeded for wallet ${walletAddress}`);
        
        // Try to get from cache if available
        const cacheKey = getTokenCacheKey(walletAddress);
        const cachedTokens = await redis.get(cacheKey);
        
        if (cachedTokens) {
          console.log(`Serving cached token data for ${walletAddress}`);
          return res.status(200).json({ 
            tokens: cachedTokens,
            fromCache: true
          });
        }
        
        return res.status(429).json({ 
          error: "Too many requests", 
          message: "Please try again in a few seconds" 
        });
      }
      
      // Increment the rate limit counter
      await redis.set(rateLimitKey, requestCount + 1, { ex: RATE_LIMIT_DURATION });
    }

    // Check cache first
    const cacheKey = getTokenCacheKey(walletAddress);
    const cachedTokens = await redis.get(cacheKey);
    
    if (cachedTokens && req.query.refresh !== 'true') {
      console.log(`Serving cached token data for ${walletAddress}`);
      return res.status(200).json({ 
        tokens: cachedTokens,
        fromCache: true
      });
    }

    // Use Helius RPC endpoint to get all assets
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'token-holdings',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true
          }
        }
      })
    });

    const data = await response.json();

    if (!data.result?.items) {
      console.error('Unexpected API response format:', data);
      return res.status(500).json({ error: "Invalid API response" });
    }

    // Transform the data into a simpler format
    const tokens = data.result.items.map((asset: any) => ({
      tokenAddress: asset.id || asset.mint || asset.content?.metadata?.mint,
      balance: asset.token_info?.balance || '0'
    })).filter((token: any) => token.tokenAddress && token.balance !== '0');

    // Get native SOL balance
    const solBalanceResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'sol-balance',
        method: 'getBalance',
        params: [walletAddress]
      })
    });

    const solData = await solBalanceResponse.json();
    
    // Add native SOL token if balance exists
    if (solData.result?.value) {
      // Convert lamports to SOL (1 SOL = 10^9 lamports)
      const solBalance = (solData.result.value / 1_000_000_000).toString();
      tokens.unshift({
        tokenAddress: 'native',
        balance: solBalance
      });
    }

    // Cache the tokens
    await redis.set(cacheKey, tokens, { ex: CACHE_DURATION });
    console.log(`Cached token data for ${walletAddress}`);

    return res.status(200).json({ 
      tokens,
      fromCache: false
    });
  } catch (error) {
    console.error("Error fetching token holdings:", error);
    return res.status(500).json({ error: "Failed to fetch token holdings" });
  }
} 