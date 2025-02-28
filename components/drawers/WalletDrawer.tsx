import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { WalletWithMetadata } from "@privy-io/react-auth";
import { isSolanaWallet, truncateWalletAddress } from "@/utils/wallet";
import { useState, useCallback, useEffect } from "react";
import { useGlobalContext } from "@/lib/context";
import Image from "next/image";
import { WalletMinimal, Download, Plus } from "lucide-react";
import { FundingDrawer } from "./FundingDrawer";

// TODO: Refactoring Recommendation
// Move all wallet-related functionality to the GlobalContext:
//
// 1. Wallet Detection & Management:
//    - Move embedded wallet detection to context.tsx
//    - Add wallet connection status tracking
//    - Centralize wallet address management
//
// 2. Wallet Operations:
//    - Add fundWallet and exportWallet functions to the context
//    - Add wallet state (isFunding, isExporting, fundingExitMessage)
//    - Handle funding callbacks in the context
//
// 3. Token Management:
//    - Already implemented: tokenHoldings in context
//    - Add helper functions for getting token balances by symbol
//
// Benefits:
// - Single source of truth for wallet data
// - Consistent wallet state across components
// - Simplified component code (this file would be much smaller)
// - Reusable wallet operations throughout the app

interface WalletDrawerProps {
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

export function WalletDrawer({
  open,
  onOpenChange,
  onBack,
}: WalletDrawerProps) {
  const { user, logout } = usePrivy();
  const { exportWallet } = useSolanaWallets();
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { tokenHoldings, walletAddress } = useGlobalContext();
  // Add state to track if we should reopen the drawer
  const [shouldReopenDrawer, setShouldReopenDrawer] = useState(false);
  // Add state for SOL balance and price
  const [solBalance, setSolBalance] = useState("0");
  const [solPrice, setSolPrice] = useState(FALLBACK_SOL_PRICE_USD);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  // Add state for funding drawer
  const [fundingDrawerOpen, setFundingDrawerOpen] = useState(false);

  // Fetch SOL price from our Redis-cached API endpoint
  useEffect(() => {
    const fetchSolPrice = async () => {
      setIsLoadingPrice(true);
      try {
        // Use our internal API that handles caching with Redis
        const response = await fetch('/api/crypto/sol-price');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.price) {
          setSolPrice(data.price);
          console.log("SOL price:", data.price, data.fromCache ? "(from cache)" : "(fresh)");
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

  // Fetch SOL balance when wallet address changes
  useEffect(() => {
    const fetchSolBalance = async () => {
      if (!walletAddress) return;
      
      try {
        // In a real app, you would fetch this from a Solana RPC endpoint
        // For now, we'll use a mock value or check if it's in tokenHoldings
        const nativeSolToken = tokenHoldings.find(t => 
          t.tokenAddress === "native" || t.tokenAddress === "SOL"
        );
        
        if (nativeSolToken) {
          setSolBalance(nativeSolToken.balance);
        } else {
          // Default to 0 balance when no SOL token is found
          setSolBalance("0");
        }
      } catch (error) {
        console.error("Error fetching SOL balance:", error);
      }
    };

    fetchSolBalance();
  }, [walletAddress, tokenHoldings]);

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
  };

  // Function to handle when the funding drawer is closed
  const handleFundingDrawerClose = (open: boolean) => {
    setFundingDrawerOpen(open);
    if (!open) {
      // Reopen the wallet drawer when funding drawer is closed
      setTimeout(() => {
        onOpenChange(true);
      }, 100);
    }
  };

  // Function to render social accounts
  const renderSocialAccounts = () => {
    if (!user) return null;

    const socialAccounts = [];

    if (user.google) {
      socialAccounts.push(
        <div key="google" className="text-sm">
          <span className="text-muted-foreground">Google:</span>{" "}
          {user.google.email}
        </div>
      );
    }

    if (user.twitter) {
      socialAccounts.push(
        <div key="twitter" className="text-sm">
          <span className="text-muted-foreground">Twitter:</span> @
          {user.twitter.username}
        </div>
      );
    }

    if (user.github) {
      socialAccounts.push(
        <div key="github" className="text-sm">
          <span className="text-muted-foreground">GitHub:</span>{" "}
          {user.github.username}
        </div>
      );
    }

    if (socialAccounts.length === 0) return null;

    return (
      <div className="p-4 border bg-muted border-primary rounded-lg space-y-2">
        <div className="text-sm font-medium">Linked Accounts</div>
        {socialAccounts}
      </div>
    );
  };

  // Function to calculate USD value from SOL
  const calculateUsdValue = (solAmount: string): string => {
    const amount = parseFloat(solAmount);
    if (isNaN(amount)) return "$0.00";
    
    const usdValue = amount * solPrice;
    return `$${usdValue.toFixed(2)}`;
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        direction="left"
        title="Wallet"
        backButton={!!onBack}
        onBack={onBack}
        icon={<WalletMinimal className="h-5 w-5" />}
      >
        <div className="space-y-3">
          {address ? (
            <>
              <div className="p-4 border bg-muted border-primary rounded-lg space-y-3">
                <div>
                  <div className="text-xs font-medium mb-2 flex items-center">
                    <WalletMinimal className="h-4 w-4 mr-2" />
                    Your Wallet
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Input readOnly value={address || ""} />
                  </div>
                </div>

                {/* Show token holdings section regardless of tokenHoldings.length */}
                <div className="space-y-1.5 mt-4">
                  <div className="text-sm font-medium">Holdings</div>
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
                              <Image
                                src={mainToken.logo}
                                alt={mainToken.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <span className="font-medium">
                                {mainToken.symbol}
                              </span>
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
                            <span className="font-medium">
                              {mainToken.symbol}
                            </span>
                          </div>
                          <div className="font-medium">
                            {token?.balance || "0"}
                          </div>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funding
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportWallet}
                  disabled={isExporting}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isExporting ? "Exporting..." : "Export Wallet"}
                </Button>

                <div className="text-xs text-muted-foreground mt-1">
                  Export your private key to use in other wallet apps like
                  Phantom.
                </div>
              </div>

              {/* Render social accounts */}
              {renderSocialAccounts()}

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">
                Please log in to access your wallet.
              </p>
            </div>
          )}
        </div>
      </Drawer>

      {/* Funding Drawer */}
      <FundingDrawer
        open={fundingDrawerOpen}
        onOpenChange={handleFundingDrawerClose}
        onBack={() => {
          setFundingDrawerOpen(false);
          setTimeout(() => {
            onOpenChange(true);
          }, 100);
        }}
        walletAddress={address}
      />
    </>
  );
}
