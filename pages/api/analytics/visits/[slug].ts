import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const getVisitKeys = (slug: string) => ({
  total: `analytics:${slug}:visits`,
  unique: `analytics:${slug}:unique_visitors`,
  history: `analytics:${slug}:visit_history`,
});

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
    const keys = getVisitKeys(slug);
    const [totalVisits, uniqueVisitors] = await Promise.all([
      redis.get<number>(keys.total),
      redis.scard(keys.unique),
    ]);

    return res.status(200).json({
      totalVisits: totalVisits || 0,
      uniqueVisitors: uniqueVisitors || 0,
    });
  } catch (error) {
    console.error("Error fetching visit analytics:", error);
    return res.status(500).json({ error: "Failed to fetch visit analytics" });
  }
} 