import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import type { PageData, PageItem } from "@/types";
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, neonConfig } from '@neondatabase/serverless';
import { decryptUrl, isEncryptedUrl } from '@/lib/encryption';

// Configure neon to use fetch
neonConfig.fetchConnectionCache = true;

// Initialize Prisma client with Neon adapter
const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeonHTTP(sql);
// @ts-ignore - Prisma doesn't have proper edge types yet
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allOperations({ operation, args, query }) {
      return query(args);
    },
  },
});

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Helper function to verify wallet ownership
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug, itemId, walletAddress } = req.body;

    // Log the request data
    console.log('Token gated content request:', {
      slug,
      itemId,
      walletAddress,
      body: req.body,
      cookies: req.cookies
    });

    if (!slug || !itemId) {
      return res.status(400).json({ 
        error: "Slug and itemId are required",
        received: { slug, itemId }
      });
    }

    if (!walletAddress) {
      return res.status(400).json({ 
        error: "Wallet address is required",
        received: { walletAddress }
      });
    }

    // Get the page data using Prisma
    const pageData = await prisma.page.findUnique({
      where: { slug },
      include: {
        items: true
      }
    });

    if (!pageData) {
      return res.status(404).json({ 
        error: "Page not found",
        slug
      });
    }

    // Verify wallet ownership
    try {
      await verifyWalletOwnership(req, walletAddress);
    } catch (error) {
      return res.status(401).json({
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Failed to verify wallet ownership"
      });
    }

    // Find the specific item
    const item = pageData.items.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ 
        error: "Item not found",
        itemId,
        availableItems: pageData.items.map(i => ({ id: i.id, presetId: i.presetId }))
      });
    }

    // If item is not token gated or doesn't have a URL, return error
    if (!item.tokenGated || !item.url) {
      return res.status(400).json({ 
        error: "Item is not token gated or has no URL",
        isTokenGated: item.tokenGated,
        hasUrl: !!item.url,
        presetId: item.presetId
      });
    }

    // Decrypt the URL if it's encrypted
    let decryptedUrl = item.url;
    if (isEncryptedUrl(item.url)) {
      try {
        decryptedUrl = decryptUrl(item.url);
      } catch (error) {
        console.error('Failed to decrypt URL:', error);
        return res.status(500).json({ error: "Failed to decrypt URL" });
      }
    }

    // Return the decrypted URL with any token replacements
    return res.status(200).json({ 
      url: decryptedUrl.replace('[token]', pageData.connectedToken || '')
    });

  } catch (error) {
    console.error("Error fetching token gated content:", error);
    return res.status(500).json({ 
      error: "Failed to fetch token gated content",
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 