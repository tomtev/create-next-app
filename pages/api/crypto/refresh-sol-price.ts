import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method with an API key for security
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simple API key check - in production, use a more secure method
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Call our sol-price endpoint with refresh=true to force a cache refresh
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/crypto/sol-price?refresh=true`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to refresh price: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: "SOL price cache refreshed successfully",
      newPrice: data.price,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error refreshing SOL price cache:", error);
    return res.status(500).json({ error: "Failed to refresh SOL price cache" });
  }
} 