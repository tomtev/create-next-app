import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import { PageData, PageItem } from '@/types';
import Loader from "@/components/ui/loader";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { usePrivy } from "@privy-io/react-auth";
import { JupiterLogo } from "@/components/icons/JupiterLogo";
import { useState } from "react";
import { PrivyClient } from "@privy-io/server-auth";
import { useToast } from "@/hooks/use-toast";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const privyClient = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Dynamically import the parent page
const ParentPage = dynamic(() => import('../../[page]'), {
  loading: () => <div className="fixed inset-0 flex items-center justify-center"><Loader /></div>,
  ssr: true,
});

interface GatedLinkPageProps {
  pageData: PageData;
  slug: string;
  error?: string;
  isOwner: boolean;
  linkItem: PageItem | null;
  hasAccess: boolean;
  gatedUrl: string | null;
}

// Update the checkTokenHoldings function
async function checkTokenHoldings(walletAddress: string, tokenAddress: string, requiredAmount: string): Promise<boolean> {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  
  if (!HELIUS_API_KEY) {
    console.error('Missing Helius API key');
    return false;
  }

  try {
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

    if (!data.result?.items) {
      return false;
    }

    const tokenHolding = data.result.items
      .find((asset: any) => 
        (asset.id || asset.mint || asset.content?.metadata?.mint)?.toLowerCase() === tokenAddress.toLowerCase()
      );

    const balance = tokenHolding?.token_info?.balance || '0';
    return parseFloat(balance) >= parseFloat(requiredAmount);
  } catch (error) {
    console.error('Error checking token holdings:', error);
    return false;
  }
}

export const getServerSideProps: GetServerSideProps<GatedLinkPageProps> = async (context) => {
  const linkId = context.params?.link_id as string;
  
  try {
    // Import and call the parent getServerSideProps
    const parentGetServerSideProps = (await import('../../[page]')).getServerSideProps;
    const result = await parentGetServerSideProps(context);
    
    if ('props' in result && !('redirect' in result) && !('notFound' in result)) {
      const parentProps = await Promise.resolve(result.props);
      const linkItem = parentProps.pageData.items?.find((item: PageItem) => item.id === linkId);
      
      if (!linkItem) {
        return { notFound: true };
      }

      let hasAccess = false;
      let gatedUrl = null;

      // Check token access if we have an identity token
      const idToken = context.req.cookies["privy-id-token"];
      if (idToken && linkItem.requiredTokens?.[0] && parentProps.pageData.connectedToken) {
        try {
          const user = await privyClient.getUser({ idToken });
          
          // Find the user's wallet
          let userWallet = null;
          for (const account of user.linkedAccounts) {
            if (account.type === "wallet" && account.chainType === "solana") {
              const walletAccount = account as { address?: string };
              userWallet = walletAccount.address;
              break;
            }
          }

          if (userWallet) {
            hasAccess = await checkTokenHoldings(
              userWallet,
              parentProps.pageData.connectedToken,
              linkItem.requiredTokens[0]
            );

            if (hasAccess) {
              gatedUrl = linkItem.url || null;
            }
          }
        } catch (error) {
          console.error('Error verifying token access:', error);
        }
      }

      return {
        props: {
          ...parentProps,
          linkItem,
          hasAccess,
          gatedUrl
        }
      };
    }
    
    return { notFound: true };
  } catch (error) {
    console.error('Error in gated link getServerSideProps:', error);
    return {
      props: {
        pageData: {} as PageData,
        slug: context.params?.page as string,
        error: 'Failed to load page data',
        isOwner: false,
        linkItem: null,
        hasAccess: false,
        gatedUrl: null
      }
    };
  }
};

export default function GatedLinkPage(props: GatedLinkPageProps) {
  const router = useRouter();
  const { page } = router.query;
  const { login, authenticated, user } = usePrivy();
  const [isChecking, setIsChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(props.hasAccess);
  const [gatedUrl, setGatedUrl] = useState(props.gatedUrl);
  const { toast } = useToast();

  // Track link clicks
  const trackClick = async (isGated: boolean) => {
    if (!props.linkItem) return;
    try {
      await fetch("/api/analytics/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: props.slug,
          itemId: props.linkItem.id,
          isGated,
        }),
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const handleCheckAgain = async () => {
    if (!props.linkItem?.requiredTokens?.[0] || !props.pageData.connectedToken || !user) return;

    setIsChecking(true);
    try {
      // Find the user's Solana wallet
      const solanaWallet = user.linkedAccounts.find(
        account => account.type === "wallet" && account.chainType === "solana"
      ) as { address?: string } | undefined;

      if (!solanaWallet?.address) {
        throw new Error('No Solana wallet found');
      }

      // Call our API endpoint instead of KV directly
      const response = await fetch('/api/verify-token-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: solanaWallet.address,
          tokenAddress: props.pageData.connectedToken,
          requiredAmount: props.linkItem.requiredTokens[0]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token verification error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error('Failed to verify token access');
      }

      const { hasAccess: newHasAccess, balance } = await response.json();
      
      console.log('Token verification result:', {
        tokenAddress: props.pageData.connectedToken,
        requiredAmount: props.linkItem.requiredTokens[0],
        balance,
        hasAccess: newHasAccess
      });

      setHasAccess(newHasAccess);
      if (newHasAccess && props.linkItem.url) {
        setGatedUrl(props.linkItem.url);
        toast({
          title: "Access Granted! 🎉",
          description: `You have enough ${props.pageData.tokenSymbol} tokens to access this link.`,
          variant: "default",
        });
      } else {
        setGatedUrl(null);
        toast({
          title: "Access Denied",
          description: `You need ${props.linkItem.requiredTokens[0]} ${props.pageData.tokenSymbol}, but you only have ${balance}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
      setGatedUrl(null);
      toast({
        title: "Error",
        description: "Failed to verify token access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!props.linkItem) {
    router.replace(`/${page}`);
    return null;
  }

  // Use local state for hasAccess and gatedUrl instead of props
  const currentHasAccess = hasAccess;
  const currentGatedUrl = gatedUrl;

  return (
    <>
      {/* Render the parent page in the background */}
      <div className="pointer-events-none">
        <ParentPage {...props} />
      </div>

      {/* Render the drawer */}
      <Drawer
        open={true}
        onOpenChange={(open) => {
          if (!open) router.push(`/${page}`);
        }}
      >
        <DrawerContent>
          <DrawerFooter className="gap-3 text-center pf-container mx-auto">
            {props.pageData.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={props.pageData.image}
                  alt={`${props.pageData.tokenSymbol} token`}
                  className="w-12 h-12 rounded-full animate-rotate3d"
                />
              </div>
            )}
            {!authenticated ? (
              <Button onClick={login} className="w-full">
                Connect Wallet
              </Button>
            ) : currentHasAccess ? (
              <>
                <div className="inline-flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full mx-auto mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4 text-green-600">
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Access Verified
                </div>
                {currentGatedUrl ? (
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => trackClick(true)}>
                    <a
                      href={currentGatedUrl}
                      target="_blank"
                      rel="noopener noreferrer">
                      Open Link
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    <Loader className="h-4 w-4 mr-2" />
                    Fetching Link...
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full mx-auto mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4 text-orange-600">
                    <path
                      fillRule="evenodd"
                      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  You need {props.linkItem.requiredTokens?.[0] || "0"} ${props.pageData.tokenSymbol} to access
                </div>
                <Button variant="outline" asChild className="w-full">
                  <a
                    href={`https://jup.ag/swap/SOL-${props.pageData.connectedToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2">
                    <JupiterLogo className="w-4 h-4" />
                    Get ${props.pageData.tokenSymbol} on Jupiter
                  </a>
                </Button>
                <Button 
                  onClick={handleCheckAgain} 
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <Loader className="h-4 w-4 mr-2" />
                      Checking...
                    </>
                  ) : (
                    "Check again"
                  )}
                </Button>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
} 