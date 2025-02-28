import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  usePrivy,
  useSolanaWallets,
  useLinkAccount,
} from "@privy-io/react-auth";
import { WalletWithMetadata } from "@privy-io/react-auth";
import { isSolanaWallet, truncateWalletAddress } from "@/utils/wallet";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useGlobalContext } from "@/lib/context";
import Image from "next/image";
import { WalletMinimal, Download, Plus, User, RefreshCw, Copy } from "lucide-react";
import { TwitterIcon } from "@/lib/icons";
import { FundingDrawer } from "./FundingDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotatingCoin } from "@/components/ui/RotatingCoin";

interface AccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

// Token information type
type TokenInfo = {
  symbol: string;
  logo: string;
  address: string;
  isNative?: boolean;
};

// Main tokens to display prominently
const MAIN_TOKENS: TokenInfo[] = [
  {
    symbol: "SOL",
    logo: "/images/sol.avif", // Use the existing sol.avif file
    address: "native", // Native SOL doesn't have a token address
    isNative: true,
  },
];

// Fallback SOL price in USD in case API fails
const FALLBACK_SOL_PRICE_USD = 150;

export function AccountDrawer({
  open,
  onOpenChange,
  onBack,
}: AccountDrawerProps) {
  const { user, logout } = usePrivy();
  const { exportWallet } = useSolanaWallets();
  const { linkTwitter } = useLinkAccount();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const {
    tokenHoldings,
    walletAddress,
    userPages,
    refreshTokens,
    isLoadingTokens,
  } = useGlobalContext();
  // Add state to track if we should reopen the drawer
  const [shouldReopenDrawer, setShouldReopenDrawer] = useState(false);
  // Add state for SOL price
  const [solPrice, setSolPrice] = useState(FALLBACK_SOL_PRICE_USD);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  // Add state for funding drawer
  const [fundingDrawerOpen, setFundingDrawerOpen] = useState(false);
  // Add state to track if funding is in progress
  const [isFundingInProgress, setIsFundingInProgress] = useState(false);
  // Add state for Twitter linking
  const [isLinkingTwitter, setIsLinkingTwitter] = useState(false);
  // Add state for refreshing token holdings
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get SOL balance from token holdings
  const solBalance = useMemo(() => {
    const solToken = tokenHoldings.find((t) => t.tokenAddress === "native");
    return solToken?.balance || "0";
  }, [tokenHoldings]);

  // Fetch SOL price from our Redis-cached API endpoint
  useEffect(() => {
    const fetchSolPrice = async () => {
      setIsLoadingPrice(true);
      try {
        // Use our internal API that handles caching with Redis
        const response = await fetch("/api/crypto/sol-price");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.price) {
          setSolPrice(data.price);
          console.log(
            "SOL price:",
            data.price,
            data.fromCache ? "(from cache)" : "(fresh)"
          );
        } else {
          console.warn("Using fallback SOL price");
          setSolPrice(FALLBACK_SOL_PRICE_USD);
        }
      } catch (error) {
        console.error("Error fetching SOL price:", error);
        console.warn("Using fallback SOL price");
        setSolPrice(FALLBACK_SOL_PRICE_USD);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchSolPrice();

    // Refresh price every 5 minutes, but our API will serve cached data
    // This ensures UI stays updated if the user keeps the app open for a long time
    const intervalId = setInterval(fetchSolPrice, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Find the embedded wallet from user's linked accounts
  const embeddedWallet = user?.linkedAccounts?.find(
    (account) => isSolanaWallet(account) && account.walletClientType === "privy"
  ) as WalletWithMetadata | undefined;

  // Use the wallet address from context if available, otherwise from the embedded wallet
  const address =
    walletAddress ||
    (embeddedWallet && "address" in embeddedWallet
      ? embeddedWallet.address
      : undefined);

  // Function to handle exporting the wallet using Privy's exportWallet method
  const handleExportWallet = async () => {
    if (address) {
      try {
        setIsExporting(true);

        // Close the drawer before opening the export modal
        onOpenChange(false);
        // Set flag to reopen drawer when export flow completes
        setShouldReopenDrawer(true);

        // Use the exportWallet method from the useSolanaWallets hook
        // This will show a Privy modal where users can copy their private key
        await exportWallet({
          address: address,
        });

        // Since exportWallet doesn't accept callbacks, we'll handle reopening here
        // after the await completes
        // Increased delay to ensure the Privy modal is fully closed
        setTimeout(() => {
          onOpenChange(true);
          setShouldReopenDrawer(false);
        }, 500);
      } catch (error) {
        console.error("Error exporting wallet:", error);
        // Reopen the drawer if there was an error
        onOpenChange(true);
        setShouldReopenDrawer(false);
      } finally {
        setIsExporting(false);
      }
    }
  };

  // Function to open the funding drawer
  const handleOpenFundingDrawer = () => {
    // Close the wallet drawer
    onOpenChange(false);
    // Open the funding drawer
    setFundingDrawerOpen(true);
    // Reset funding in progress state
    setIsFundingInProgress(false);
  };

  // Function to handle when the funding drawer is closed
  const handleFundingDrawerClose = (
    open: boolean,
    fundingInProgress?: boolean
  ) => {
    setFundingDrawerOpen(open);

    // Update funding in progress state
    if (fundingInProgress !== undefined) {
      setIsFundingInProgress(fundingInProgress);
    }

    if (!open) {
      // Only reopen the wallet drawer when funding drawer is closed
      // AND funding is not in progress
      if (!isFundingInProgress && !fundingInProgress) {
        setTimeout(() => {
          onOpenChange(true);
        }, 100);
      }
    }
  };

  // Function to handle linking Twitter account
  const handleLinkTwitter = async () => {
    try {
      setIsLinkingTwitter(true);

      // Close the drawer before opening the Twitter auth flow
      onOpenChange(false);
      // Set flag to reopen drawer when Twitter linking completes
      setShouldReopenDrawer(true);

      // Use Privy's linkTwitter method
      await linkTwitter();

      // Reopen the drawer after linking completes
      setTimeout(() => {
        onOpenChange(true);
        setShouldReopenDrawer(false);
      }, 500);
    } catch (error) {
      console.error("Error linking Twitter:", error);
      // Reopen the drawer if there was an error
      onOpenChange(true);
      setShouldReopenDrawer(false);
    } finally {
      setIsLinkingTwitter(false);
    }
  };

  // Function to calculate USD value from SOL
  const calculateUsdValue = (solAmount: string): string => {
    const amount = parseFloat(solAmount);
    if (isNaN(amount)) return "$0.00";

    const usdValue = amount * solPrice;
    return `$${usdValue.toFixed(2)}`;
  };

  // Handle tab change - restore refresh when wallet tab is selected
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Refresh token holdings when switching to wallet tab
    if (value === "wallet" && walletAddress) {
      console.log("Wallet tab opened, refreshing token holdings");
      refreshTokens();
    }
  };

  // Function to manually refresh token holdings
  const handleRefreshTokens = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log("Manually refreshing token holdings");
      await refreshTokens();
    } catch (error) {
      console.error("Error refreshing token holdings:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Render the profile tab content
  const renderProfileTab = () => {
    if (!user)
      return (
        <div className="text-center p-4">
          <p className="text-muted-foreground mb-4">
            Please log in to view your profile.
          </p>
        </div>
      );

    // Get display name from available user properties
    const displayName =
      user.email?.address ||
      user.twitter?.username ||
      user.google?.email ||
      "User";

    // Get avatar URL from available user properties
    const avatarUrl = user.twitter?.profilePictureUrl || null;

    return (
      <div className="space-y-5">
        {/* Profile header - horizontal layout */}
        <div className="flex items-center gap-4 p-4 bg-background border border-primary rounded-lg">
          <Avatar className="h-12 w-12 shrink-0">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt={typeof displayName === "string" ? displayName : "User"}
              />
            )}
            <AvatarFallback>
              {typeof displayName === "string"
                ? displayName.charAt(0).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {!user.twitter && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkTwitter}
                disabled={isLinkingTwitter}
                className="mt-2 h-8 text-xs mb-2"
              >
                <TwitterIcon size={14} className="mr-1.5" />
                {isLinkingTwitter ? "Connecting..." : "Connect Twitter / X"}
              </Button>
            )}

            <h3 className="text-xs truncate">{displayName}</h3>
          </div>
        </div>

        {/* Pages section */}
        {userPages && userPages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Your Pages</h3>
            <div className="space-y-2">
              {userPages.map((page) => (
                <Card
                  key={page.slug}
                  className="p-2.5 hover:bg-muted/50 transition-colors"
                >
                  <a href={`/${page.slug}`} className="flex items-center gap-3">
                    {page.image ? (
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                        <Image
                          src={page.image}
                          alt={page.title || page.slug}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">
                          {page.title?.charAt(0) || page.slug.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {page.title || page.slug}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        page.fun/{page.slug}
                      </div>
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Logout button */}
        <div>
          <Button
            variant="outline"
            onClick={logout}
            className="w-full shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  };

  // Render the wallet tab content
  const renderWalletTab = () => {
    if (!address)
      return (
        <div className="text-center p-4">
          <p className="text-muted-foreground mb-4">
            Please log in to access your wallet.
          </p>
        </div>
      );

    return (
      <div className="space-y-4">
        <div className=" space-y-3">
          <div>
            <div className="text-xs font-medium mb-2 flex items-center">
              Your Wallet
            </div>
            <div className="text-sm text-muted-foreground flex gap-2">
              <Input readOnly value={address || ""} className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address);
                  }
                }}
                className="shrink-0"
                title="Copy wallet address"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Show token holdings section regardless of tokenHoldings.length */}
          <div className="space-y-1.5 mt-4">
            <div className="text-sm font-medium flex items-center justify-between">
              <span>Holdings</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={handleRefreshTokens}
                disabled={isRefreshing || isLoadingTokens}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshing || isLoadingTokens ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
            <div className="space-y-1">
              {/* Show SOL and USD (USDC) */}
              {MAIN_TOKENS.map((mainToken) => {
                // For native SOL, use the solBalance state
                if (mainToken.isNative) {
                  return (
                    <div
                      key={mainToken.symbol}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <RotatingCoin
                          src={mainToken.logo}
                          alt={mainToken.symbol}
                          size="sm"
                          rotationSpeed="slow"
                          coinColor="#9945FF" // Purple color for SOL
                          shineEffect={true}
                        />
                        <span className="font-medium">{mainToken.symbol}</span>
                      </div>
                      <div className="font-medium flex flex-col items-end">
                        <span>{solBalance}</span>
                        <span className="text-xs text-muted-foreground">
                          {calculateUsdValue(solBalance)}
                        </span>
                      </div>
                    </div>
                  );
                }

                // For other tokens like USDC
                const token = tokenHoldings.find(
                  (t) => t.tokenAddress === mainToken.address
                );

                return (
                  <div
                    key={mainToken.address}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Image
                        src={mainToken.logo}
                        alt={mainToken.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-medium">{mainToken.symbol}</span>
                    </div>
                    <div className="font-medium">{token?.balance || "0"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Funding Button */}
          <Button
            variant="theme"
            onClick={handleOpenFundingDrawer}
            className="w-full"
          >
            Add Funds
          </Button>

          <Button
            variant="outline"
            onClick={handleExportWallet}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? "Exporting..." : "Export Wallet"}
          </Button>

          <div className="text-xs text-muted-foreground mt-1">
            Export your private key to use in other wallet apps like Phantom.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        direction="left"
        title="Account"
        backButton={!!onBack}
        onBack={onBack}
        closeButton={true}
        icon={<User className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <WalletMinimal className="h-4 w-4 mr-2" />
                <span>Wallet</span>
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="profile">{renderProfileTab()}</TabsContent>
              <TabsContent value="wallet">{renderWalletTab()}</TabsContent>
            </div>
          </Tabs>
        </div>
      </Drawer>

      {/* Funding Drawer */}
      <FundingDrawer
        open={fundingDrawerOpen}
        onOpenChange={handleFundingDrawerClose}
        onBack={() => {
          // Close the funding drawer
          setFundingDrawerOpen(false);
          // Only reopen the wallet drawer if funding is not in progress
          if (!isFundingInProgress) {
            setTimeout(() => {
              onOpenChange(true);
            }, 100);
          }
        }}
        walletAddress={address}
      />
    </>
  );
}
