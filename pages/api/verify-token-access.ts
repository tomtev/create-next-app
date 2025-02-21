import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, tokenAddress, requiredAmount } = req.body;

    if (!walletAddress || !tokenAddress || !requiredAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      // Get token holdings from Redis
      const tokenHoldings = await redis.get<{ tokens: Array<{ tokenAddress: string, balance: string }> }>(`token-holdings:${walletAddress.toLowerCase()}`);
      
      if (!tokenHoldings || !Array.isArray(tokenHoldings.tokens)) {
        console.log('No token holdings found for wallet:', walletAddress);
        return res.status(200).json({ 
          hasAccess: false,
          balance: '0'
        });
      }

      const tokenHolding = tokenHoldings.tokens.find(t => 
        t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
      );

      console.log('Token holding check:', {
        walletAddress,
        tokenAddress,
        requiredAmount,
        foundToken: tokenHolding
      });

      const hasAccess = tokenHolding && parseFloat(tokenHolding.balance) >= parseFloat(requiredAmount);

      return res.status(200).json({ 
        hasAccess,
        balance: tokenHolding?.balance || '0'
      });
    } catch (redisError) {
      console.error('Redis error:', redisError);
      throw new Error('Failed to fetch token holdings from Redis');
    }
  } catch (error) {
    console.error('Error verifying token access:', error);
    return res.status(500).json({ error: 'Failed to verify token access' });
  }
} 