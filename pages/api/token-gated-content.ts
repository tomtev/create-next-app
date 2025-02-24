import type { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import type { PageData, PageItem } from "@/types";
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
    const { slug, itemId } = req.body;

    // Log the request data
    console.log('Token gated content request:', {
      slug,
      itemId,
      body: req.body,
      cookies: req.cookies
    });

    if (!slug || !itemId) {
      return res.status(400).json({ 
        error: "Slug and itemId are required",
        received: { slug, itemId }
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

    // Verify token access first
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Return only the URL
    return res.status(200).json({ 
      url: item.url.replace('[token]', pageData.connectedToken || '')
    });

  } catch (error) {
    console.error("Error fetching token gated content:", error);
    return res.status(500).json({ 
      error: "Failed to fetch token gated content",
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 