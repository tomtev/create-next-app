import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Verify authentication and wallet ownership
async function verifyWalletOwnership(
  req: NextApiRequest,
  walletAddress: string,
) {
  const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, "");
  const cookieAuthToken = req.cookies["privy-token"];

  const authToken = cookieAuthToken || headerAuthToken;
  if (!authToken) {
    throw new Error("Missing auth token");
  }

  try {
    // Verify the auth token
    const claims = await client.verifyAuthToken(authToken);
    
    // Get the user details to check wallet ownership
    const user = await client.getUser(claims.userId);

    // Check if the wallet address is in the user's linked accounts
    const hasWallet = user.linkedAccounts.some((account) => {
      if (account.type === "wallet" && account.chainType === "solana") {
        const walletAccount = account as { address?: string };
        return walletAccount.address?.toLowerCase() === walletAddress.toLowerCase();
      }
      return false;
    });

    if (!hasWallet) {
      throw new Error("Wallet not owned by authenticated user");
    }

    return user;
  } catch (error) {
    throw error;
  }
}

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
    // Verify the user is authenticated and owns the wallet
    try {
      await verifyWalletOwnership(req, walletAddress);
    } catch (error) {
      return res.status(401).json({
        error: error instanceof Error ? error.message : "Authentication failed",
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

    console.log('Token holdings data:', data);

    if (!data.result?.items) {
      console.error('Unexpected API response format:', data);
      return res.status(500).json({ error: "Invalid API response" });
    }

    // Transform the data into a simpler format
    const tokens = data.result.items.map((asset: any) => ({
      tokenAddress: asset.id || asset.mint || asset.content?.metadata?.mint,
      balance: asset.token_info?.balance || '0'
    })).filter((token: any) => token.tokenAddress && token.balance !== '0');

    return res.status(200).json({ tokens });
  } catch (error) {
    console.error("Error fetching token holdings:", error);
    return res.status(500).json({ error: "Failed to fetch token holdings" });
  }
} 