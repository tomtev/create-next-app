import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, neonConfig } from '@neondatabase/serverless';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug, walletAddress } = req.body;

    if (!slug || !walletAddress) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Verify user authentication
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user from Privy
    const user = await client.getUser({ idToken });

    // Check if the wallet is in user's linked accounts
    const hasWallet = user.linkedAccounts.some((account) => {
      if (account.type === "wallet" && account.chainType === "solana") {
        const walletAccount = account as { address?: string };
        return walletAccount.address?.toLowerCase() === walletAddress.toLowerCase();
      }
      return false;
    });

    if (!hasWallet) {
      return res.status(401).json({ error: "Wallet not owned by user" });
    }

    // Fetch page data to check ownership
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Check page ownership
    const isOwner = page.walletAddress.toLowerCase() === walletAddress.toLowerCase();

    return res.status(200).json({
      isOwner,
    });
  } catch (error) {
    console.error("Error verifying page access:", error);
    return res.status(500).json({ error: "Failed to verify page access" });
  }
}
