import { NextApiRequest, NextApiResponse } from 'next';

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, tokenAddress, requiredAmount } = req.body;

    if (!walletAddress || !tokenAddress || !requiredAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!HELIUS_API_KEY) {
      console.error('Missing Helius API key');
      return res.status(500).json({ error: "Server configuration error" });
    }

    try {
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
        console.log('No token holdings found for wallet:', walletAddress);
        return res.status(200).json({ 
          hasAccess: false,
          balance: '0'
        });
      }

      // Find the specific token we're looking for
      const tokenHolding = data.result.items
        .find((asset: any) => 
          (asset.id || asset.mint || asset.content?.metadata?.mint)?.toLowerCase() === tokenAddress.toLowerCase()
        );

      const balance = tokenHolding?.token_info?.balance || '0';

      console.log('Token holding check:', {
        walletAddress,
        tokenAddress,
        requiredAmount,
        foundToken: tokenHolding
      });

      const hasAccess = parseFloat(balance) >= parseFloat(requiredAmount);

      return res.status(200).json({ 
        hasAccess,
        balance
      });
    } catch (fetchError) {
      console.error('Error fetching from Helius:', fetchError);
      throw new Error('Failed to fetch token holdings');
    }
  } catch (error) {
    console.error('Error verifying token access:', error);
    return res.status(500).json({ error: 'Failed to verify token access' });
  }
} 