import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

type MetadataResponse = {
  metadata?: TokenMetadata;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetadataResponse>,
) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Token address is required" });
  }

  // Validate address format
  if (typeof address !== 'string' || address.length !== 44) {
    return res.status(400).json({ error: "Invalid Solana address format" });
  }

  try {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!HELIUS_API_KEY) {
      throw new Error("Helius API key is not configured");
    }

    console.log('Fetching token:', address);

    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}&mintAccounts=${address}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!response.ok) {
      console.error('API Response not OK:', response.status);
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // The API returns an array of metadata objects
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No metadata found');
      return res.status(404).json({ error: "Token metadata not found" });
    }

    const tokenData = data[0];
    if (!tokenData) {
      return res.status(404).json({ error: "Token metadata not found" });
    }

    // Extract metadata from the response
    const onChainMetadata = tokenData.onChainMetadata || {};
    const offChainMetadata = tokenData.offChainMetadata || {};

    const name = offChainMetadata.name || onChainMetadata.name || tokenData.name || "Unknown Token";
    const symbol = offChainMetadata.symbol || onChainMetadata.symbol || tokenData.symbol;
    const description = offChainMetadata.description || onChainMetadata.description;
    const image = offChainMetadata.image || onChainMetadata.uri || null;

    return res.status(200).json({
      metadata: {
        name,
        description,
        symbol,
        image,
      },
    });
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch token metadata";
    // If the error contains "not found" or "invalid", return 404
    if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("invalid")) {
      return res.status(404).json({ error: "Token not found or invalid" });
    }
    return res.status(500).json({ error: errorMessage });
  }
}
