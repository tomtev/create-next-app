import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
  attributes?: any[];
};

type MetadataResponse = {
  metadata?: TokenMetadata;
  error?: string;
};

const IPFS_GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
];

let lastSuccessfulGateway: string | null = null;

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchJsonUri(uri: string) {
  // If it's an IPFS URI, try multiple gateways
  if (uri.includes("ipfs")) {
    const cid = uri.split("ipfs/").pop();
    if (!cid) return null;

    console.log("Attempting to fetch IPFS content with CID:", cid);

    for (const gateway of IPFS_GATEWAYS) {
      try {
        console.log("Trying gateway:", gateway);
        const response = await fetchWithTimeout(gateway + cid);
        if (response.ok) {
          const data = await response.json();
          console.log("Successfully fetched from gateway:", gateway);
          lastSuccessfulGateway = gateway;
          return data;
        }
      } catch (error: any) {
        console.log(
          "Failed to fetch from gateway:",
          gateway,
          error?.message || "Unknown error"
        );
        continue;
      }
    }
    console.error("All IPFS gateways failed");
    return null;
  }

  // For non-IPFS URIs, try direct fetch
  try {
    const response = await fetchWithTimeout(uri);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching JSON URI:", error);
    return null;
  }
}

function getIpfsUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  let cid: string | undefined;

  if (url.includes("ipfs://")) {
    cid = url.replace("ipfs://", "");
  } else if (url.includes("/ipfs/")) {
    cid = url.split("/ipfs/").pop();
  }

  if (cid) {
    // Use the last successful gateway if available, otherwise use the first gateway
    const gateway = lastSuccessfulGateway || IPFS_GATEWAYS[0];
    return `${gateway}${cid}`;
  }

  return url;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetadataResponse>
) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Token address is required" });
  }

  try {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!HELIUS_API_KEY) {
      throw new Error("Helius API key is not configured");
    }


    const apiUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    const body = {
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAsset",
      params: {
        id: address,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.result) {
      return res.status(404).json({ error: "Asset metadata not found" });
    }

    const result = data.result;

    // Extract metadata from the content field
    const content = result.content || {};
    const metadata = content.metadata || {};
    const files = content.files || [];

    // Reset the last successful gateway before fetching new data
    lastSuccessfulGateway = null;

    // Try to fetch and parse json_uri if it exists
    let jsonUriData = null;
    if (content.json_uri) {
      jsonUriData = await fetchJsonUri(content.json_uri);
    }

    // Get the image URL from various possible locations and ensure IPFS URLs are using a reliable gateway
    const rawImageUrl =
      jsonUriData?.image || // First try image from JSON URI
      metadata.image ||
      files[0]?.uri ||
      content.links?.image;

    const imageUrl = getIpfsUrl(rawImageUrl);

    const returnData = {
      metadata: {
        name:
          jsonUriData?.name || metadata.name || result.name || "Unknown Asset",
        description:
          jsonUriData?.description ||
          metadata.description ||
          content.description,
        symbol: jsonUriData?.symbol || metadata.symbol || result.symbol,
        image: imageUrl,
        attributes: metadata.attributes,
      },
    };

    return res.status(200).json(returnData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch asset metadata";
    // If the error contains "not found" or "invalid", return 404
    if (
      errorMessage.toLowerCase().includes("not found") ||
      errorMessage.toLowerCase().includes("invalid")
    ) {
      return res.status(404).json({ error: "Asset not found or invalid" });
    }
    return res.status(500).json({ error: errorMessage });
  }
}
