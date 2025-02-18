import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

interface ClickData {
  itemId: string;
  isGated: boolean;
  timestamp: number;
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const getAnalyticsKey = (slug: string) => `analytics:${slug}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid slug" });
  }

  try {
    const analyticsKey = getAnalyticsKey(slug);
    
    // Get the most recent 50 clicks
    const clickData = await redis.zrange<string[]>(analyticsKey, -50, -1);
    
    const clicks = clickData.map((data) => JSON.parse(data) as ClickData);

    return res.status(200).json({
      clicks: clicks.reverse(), // Show most recent first
    });
  } catch (error) {
    console.error("Error fetching click analytics:", error);
    return res.status(500).json({ error: "Failed to fetch click analytics" });
  }
} 