import type { NextApiRequest, NextApiResponse } from 'next';
import { PrivyClient } from "@privy-io/server-auth";
import { z } from "zod";
import { validateLinkUrl } from "../../lib/links";
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';
import { encryptUrl, decryptUrl } from '@/lib/encryption';

// Initialize Prisma client with Neon adapter - using edge-compatible initialization
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

// Validation schemas
const urlPattern = /^[a-zA-Z0-9-]+$/;
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

type TokenHolding = {
  tokenAddress: string;
  balance: string;
};

// Reserved slugs that cannot be used for pages
const RESERVED_SLUGS = [
  'pricing',
  'page',
  'about',
  'account',
  'faq',
  'terms',
  'blog',
  'edit',
  'api',
  'admin',
  'settings',
  'dashboard',
  'login',
  'signup',
  'register',
  'help',
  'support',
  'docs',
  'documentation',
  'privacy',
  'contact',
  'status',
  'home',
  'index',
  'app',
  'auth',
  'public',
  'static',
  'assets',
  'images',
  'css',
  'js',
  'fonts',
  'media'
];

const FontsSchema = z
  .object({
    global: z.string().nullable(),
    heading: z.string().nullable(),
    paragraph: z.string().nullable(),
    links: z.string().nullable(),
  })
  .optional();

const PageItemSchema = z
  .object({
    id: z.string().min(1),
    presetId: z.string().min(1),
    title: z.string().optional(),
    url: z
      .string()
      .optional()
      .nullable(),
    order: z.number().int().min(0),
    tokenGated: z.boolean().optional(),
    requiredTokens: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (!data.url || data.url.length === 0) return true;
      return validateLinkUrl(data.url, data.presetId);
    },
    {
      message: "Invalid URL format for this item type",
      path: ["url"],
    }
  );

const PageDataSchema = z.object({
  walletAddress: z.string().min(1),
  slug: z.string().min(1),
  connectedToken: z.string().nullable().optional(),
  tokenSymbol: z.string().nullable().optional(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().regex(urlRegex).nullable().optional(),
  items: z.array(PageItemSchema).optional(),
  theme: z.string().optional(),
  themeFonts: FontsSchema,
  themeColors: z.object({
    primary: z.string().nullable(),
    secondary: z.string().nullable(),
    background: z.string().nullable(),
    text: z.string().nullable(),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const CreatePageSchema = z.object({
  slug: z
    .string()
    .regex(urlPattern, "Only letters, numbers, and hyphens allowed")
    .min(1)
    .max(50)
    .refine(
      (slug) => !RESERVED_SLUGS.includes(slug.toLowerCase()),
      {
        message: "This URL is reserved and cannot be used"
      }
    ),
  walletAddress: z.string().min(1),
  isSetupWizard: z.boolean().optional(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  items: z.array(PageItemSchema).optional(),
  connectedToken: z.string().nullable().optional(),
  tokenSymbol: z.string().nullable().optional(),
  image: z.string().regex(urlRegex).nullable().optional(),
  theme: z.string().optional(),
  themeFonts: FontsSchema,
  themeColors: z.object({
    primary: z.string().nullable(),
    secondary: z.string().nullable(),
    background: z.string().nullable(),
    text: z.string().nullable(),
  }).optional(),
  pageType: z.enum(["personal", "meme", "ai-bot"]).optional(),
});

type PageItem = {
  id: string;
  pageId: string;
  presetId: string;
  title: string | null;
  url: string | null;
  order: number;
  isPlugin: boolean;
  tokenGated: boolean;
  requiredTokens: string[];
};

type PageData = {
  id: string;
  walletAddress: string;
  slug: string;
  connectedToken: string | null;
  tokenSymbol: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  items: PageItem[];
  theme: string | null;
  themeFonts: {
    global: string | null;
    heading: string | null;
    paragraph: string | null;
    links: string | null;
  } | null;
  themeColors: {
    primary: string | null;
    secondary: string | null;
    background: string | null;
    text: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Helper function to get cookies
function getCookie(req: NextApiRequest, name: string): string | undefined {
  return req.cookies[name];
}

// Update verifyWalletOwnership to use NextApiRequest
async function verifyWalletOwnership(
  req: NextApiRequest,
  walletAddress: string,
) {
  const idToken = getCookie(req, "privy-id-token");

  if (!idToken) {
    throw new Error("Missing identity token");
  }

  try {
    const user = await client.getUser({ idToken });

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

// Update getPagesForWallet to use NextRequest
async function getPagesForWallet(walletAddress: string, req: NextApiRequest) {
  try {
    const idToken = getCookie(req, "privy-id-token");
    if (!idToken) {
      throw new Error("Missing identity token");
    }

    await verifyWalletOwnership(req, walletAddress);

    const pages = await prisma.page.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { pages };
  } catch (error) {
    return { pages: [] };
  }
}

// Helper function to sanitize page data for public access
function sanitizePageData(pageData: any | null, isOwner: boolean = false): PageData | null {
  if (!pageData) return pageData;

  // If user is the owner, return full data
  if (isOwner) return pageData;

  // Clone the data to avoid mutating the original
  const sanitized = { ...pageData };

  // For non-owners, we don't need to sanitize URLs here anymore
  // This will be handled in [page].tsx
  return sanitized;
}

// Helper function to check rate limit
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; timeLeft?: number }> {
  const windowSeconds = 60 * 60; // 1 hour in seconds
  const maxPages = 10; // Maximum pages per window

  try {
    // Count pages created in the last hour
    const count = await prisma.page.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - windowSeconds * 1000),
        },
        walletAddress: userId,
      },
    });

    if (count < maxPages) {
      return { allowed: true };
    }

    // Calculate time left in the window
    const oldestPage = await prisma.page.findFirst({
      where: {
        walletAddress: userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
      },
    });

    if (!oldestPage) return { allowed: true };

    const timeLeft = windowSeconds - (Date.now() - oldestPage.createdAt.getTime()) / 1000;
    return { allowed: false, timeLeft: Math.max(0, timeLeft) };
  } catch (error) {
    return { allowed: true };
  }
}

// Helper function to check token holdings
async function checkTokenHoldings(walletAddress: string): Promise<boolean> {
  try {
    // Fetch token holdings
    const response = await fetch(`${process.env.KV_REST_API_URL}/api/token-holdings?walletAddress=${walletAddress}`, {
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token holdings');
    }

    const { tokens } = await response.json();
    const pageDotFunToken = process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN;
    const requiredHolding = process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN_REQUIRED_HOLDING;

    if (!pageDotFunToken || !requiredHolding) {
      console.error('Token configuration missing');
      return false;
    }

    const tokenHolding = tokens?.find((t: TokenHolding) => 
      t.tokenAddress.toLowerCase() === pageDotFunToken.toLowerCase()
    );

    if (!tokenHolding) {
      return false;
    }

    return parseFloat(tokenHolding.balance) >= parseFloat(requiredHolding);
  } catch (error) {
    console.error('Error checking token holdings:', error);
    return false;
  }
}

// Update the main handler to use Next.js API format
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { slug, walletAddress } = req.query;

    try {
      if (walletAddress) {
        const result = await getPagesForWallet(walletAddress as string, req as any);
        return res.status(200).json({ pages: result.pages });
      }

      if (slug) {
        const pageData = await prisma.page.findUnique({
          where: { slug: slug as string },
          include: {
            items: true,
          },
        });

        let isOwner = false;
        if (pageData) {
          try {
            const idToken = req.cookies["privy-id-token"];
            if (idToken) {
              await verifyWalletOwnership(req as any, pageData.walletAddress);
              isOwner = true;
            }
          } catch (error) {
            // Ignore verification errors
          }
        }

        const sanitizedData = sanitizePageData(pageData, isOwner);
        return res.status(200).json({ mapping: sanitizedData, isOwner });
      }

      return res.status(400).json({ error: "Slug or wallet address is required" });
    } catch (error) {
      console.error('GET handler error:', error);
      return res.status(500).json({ error: "Failed to fetch page data" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      const validationResult = CreatePageSchema.safeParse(body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const {
        slug,
        walletAddress,
        isSetupWizard,
        title,
        description,
        items,
        connectedToken,
        tokenSymbol,
        image,
        theme,
        themeFonts,
        themeColors,
        pageType,
      } = validationResult.data;

      // Check if slug exists
      const existingPage = await prisma.page.findUnique({
        where: { slug },
        include: {
          items: true,
        },
      });

      if (existingPage) {
        if (existingPage.walletAddress !== walletAddress) {
          return res.status(400).json({ error: "This URL is already taken" });
        }
      }

      // Verify ownership of the wallet
      let user;
      try {
        user = await verifyWalletOwnership(req, walletAddress);
      } catch (error) {
        return res.status(401).json({
          error: error instanceof Error ? error.message : "Authentication failed",
        });
      }

      // Check token holdings and rate limit for new pages
      if (!existingPage) {
        /*const { pages } = await getPagesForWallet(walletAddress, req);
        
        if (pages.length > 0) {
          const hasRequiredTokens = await checkTokenHoldings(walletAddress);
          if (!hasRequiredTokens) {
            return res.status(403).json({ 
              error: "Token requirement not met",
              message: `You need to hold at least ${process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN_REQUIRED_HOLDING} PAGE.FUN tokens to create more than one page`
            });
          }
        } */

        const rateLimit = await checkRateLimit(user.id);
        if (!rateLimit.allowed) {
          return res.status(429).json({
            error: "Rate limit exceeded",
            timeLeft: rateLimit.timeLeft,
            message: `You can create more pages in ${Math.ceil(rateLimit.timeLeft! / 3600)} hours`,
          });
        }
      }

      // For initial setup wizard step
      if (isSetupWizard === true) {
        await prisma.page.create({
          data: {
            slug,
            walletAddress,
          },
        });
        return res.status(200).json({ success: true });
      }

      // Create or update page with full data
      const pageData = {
        slug,
        walletAddress: walletAddress.toLowerCase(),
        title: title || null,
        description: description || null,
        connectedToken: connectedToken || null,
        tokenSymbol: tokenSymbol || null,
        image: image || null,
        theme: theme || null,
        themeFonts: themeFonts || undefined,
        themeColors: themeColors || undefined,
        pageType: pageType || null,
      };

      try {
        let page;
        if (existingPage) {
          // Update the main page first
          page = await prisma.page.update({
            where: { id: existingPage.id },
            data: pageData,
          });

          // Update related records separately
          if (items) {
            await prisma.pageItem.deleteMany({
              where: { pageId: page.id }
            });
            for (const item of items) {
              await prisma.pageItem.create({
                data: {
                  pageId: page.id,
                  presetId: item.presetId,
                  title: item.title || null,
                  url: item.tokenGated && item.url ? encryptUrl(item.url) : item.url,
                  order: item.order,
                  tokenGated: item.tokenGated || false,
                  requiredTokens: item.requiredTokens || [],
                }
              });
            }
          }
        } else {
          // Create the main page first
          page = await prisma.page.create({
            data: pageData,
          });

          // Create related records separately
          if (items && items.length > 0) {
            for (const item of items) {
              await prisma.pageItem.create({
                data: {
                  pageId: page.id,
                  presetId: item.presetId,
                  title: item.title || null,
                  url: item.tokenGated && item.url ? encryptUrl(item.url) : item.url,
                  order: item.order,
                  tokenGated: item.tokenGated || false,
                  requiredTokens: item.requiredTokens || [],
                }
              });
            }
          }
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error saving page data:', error);
        return res.status(500).json({ 
          error: "Failed to store page data",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    } catch (error) {
      console.error('POST handler error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid data format",
          details: error.issues,
        });
      }
      return res.status(500).json({ 
        error: "Failed to store page data",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const body = req.body;
      const { slug } = body;

      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      const currentPage = await prisma.page.findUnique({
        where: { slug },
        include: {
          items: true,
        },
      });

      if (!currentPage) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify wallet ownership
      try {
        await verifyWalletOwnership(req, currentPage.walletAddress);
      } catch (error) {
        return res.status(401).json({
          error: error instanceof Error ? error.message : "Authentication failed",
        });
      }

      // Delete the page and all related data
      await prisma.page.delete({
        where: { slug },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete page" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const body = req.body;
      const { slug, connectedToken, tokenSymbol, title, description, image, items, theme, themeFonts, themeColors } = body;

      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      // Verify authentication
      const idToken = req.cookies["privy-id-token"];
      if (!idToken) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get the current page
      const currentPage = await prisma.page.findUnique({
        where: { slug },
        include: {
          items: true,
        },
      });

      if (!currentPage) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify wallet ownership
      try {
        const user = await client.getUser({ idToken });
        
        // Check if the wallet is in user's linked accounts
        let isOwner = false;
        for (const account of user.linkedAccounts) {
          if (account.type === "wallet" && account.chainType === "solana") {
            const walletAccount = account as { address?: string };
            if (walletAccount.address?.toLowerCase() === currentPage.walletAddress.toLowerCase()) {
              isOwner = true;
              break;
            }
          }
        }

        if (!isOwner) {
          return res.status(401).json({ error: "You don't have permission to edit this page" });
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        return res.status(401).json({ 
          error: "Authentication failed",
          details: error instanceof Error ? error.message : "Failed to verify ownership"
        });
      }

      try {
        // Update the page
        await prisma.page.update({
          where: { slug },
          data: {
            connectedToken: connectedToken || null,
            tokenSymbol: tokenSymbol || null,
            title: title || null,
            description: description || null,
            image: image || null,
            theme: theme || "default",
            themeFonts: themeFonts ? JSON.stringify(themeFonts) : undefined,
            themeColors: themeColors ? JSON.stringify(themeColors) : undefined,
          },
        });

        // Update items if provided
        if (items) {
          // Delete existing items
          await prisma.pageItem.deleteMany({
            where: { pageId: currentPage.id }
          });

          // Create new items
          if (items.length > 0) {
            await Promise.all(items.map(async (item: any) => {
              try {
                await prisma.pageItem.create({
                  data: {
                    pageId: currentPage.id,
                    presetId: item.presetId,
                    title: item.title || null,
                    url: item.tokenGated && item.url ? encryptUrl(item.url) : item.url,
                    order: item.order,
                    tokenGated: item.tokenGated || false,
                    requiredTokens: item.requiredTokens || [],
                  }
                });
              } catch (itemError) {
                console.error("Error creating item:", itemError, item);
                throw new Error(`Failed to create item: ${item.presetId}`);
              }
            }));
          }
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Database update error:", error);
        return res.status(500).json({ 
          error: "Failed to update page",
          details: error instanceof Error ? error.message : "Database update failed"
        });
      }
    } catch (error) {
      console.error("PATCH handler error:", error);
      return res.status(500).json({ 
        error: "Failed to update page",
        details: error instanceof Error ? error.message : "Unexpected error occurred",
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Update helper function to use NextApiResponse
function jsonResponse(res: NextApiResponse, data: any, status = 200) {
  return res.status(status).json(data);
}
