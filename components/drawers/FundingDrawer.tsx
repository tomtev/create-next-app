import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSolanaFundingPlugin,
  useFundWallet,
} from "@privy-io/react-auth/solana";
import { useState, useCallback, useEffect } from "react";
import { useGlobalContext } from "@/lib/context";
import Image from "next/image";
import { Coins } from "lucide-react";

interface FundingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean, isFunding?: boolean) => void;
  onBack: () => void;
  walletAddress?: string;
}

// Fallback SOL price in USD in case API fails
const FALLBACK_SOL_PRICE_USD = 150;

export function FundingDrawer({
  open,
  onOpenChange,
  onBack,
  walletAddress,
}: FundingDrawerProps) {
  const [fundingExitMessage, setFundingExitMessage] = useState<string | null>(null);
  const [shouldReopenDrawer, setShouldReopenDrawer] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("0.5");
  const [solPrice, setSolPrice] = useState(FALLBACK_SOL_PRICE_USD);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Mount the Solana funding plugin as required by Privy
  useSolanaFundingPlugin();

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

    if (open) {
      fetchSolPrice();
    }
  }, [open]);

  // Enhanced callback for when user exits the funding flow
  const handleUserExitedFunding = useCallback(
    (params: any) => {
      console.log("User exited funding flow:", params);

      // Check if the user has a balance and if funding was successful
      if (params.balance && params.balance > 0n) {
        setFundingExitMessage(
          "Funding successful! Your SOL is now available in your wallet."
        );
      } else if (params.fundingMethod) {
        setFundingExitMessage(
          "Funding process was started but not completed. You can try again anytime."
        );
      } else {
        setFundingExitMessage(
          "Funding process was canceled. You can try again anytime."
        );
      }

      // Clear message after 5 seconds
      setTimeout(() => {
        setFundingExitMessage(null);
      }, 5000);

      // Reopen the drawer when the funding flow completes or is exited
      if (shouldReopenDrawer) {
        // Increased delay to ensure the Privy modal is fully closed
        setTimeout(() => {
          onOpenChange(true, false); // Pass false for isFunding since it's completed
          setShouldReopenDrawer(false);
        }, 500);
      }
    },
    [onOpenChange, shouldReopenDrawer]
  );

  // Handle successful funding
  const handleFundingSuccess = useCallback(
    (params: any) => {
      console.log("Funding successful:", params);

      // Set success message
      setFundingExitMessage(
        "Funding successful! Your SOL is now available in your wallet."
      );

      // Clear message after 5 seconds
      setTimeout(() => {
        setFundingExitMessage(null);
      }, 5000);

      // Reopen the drawer after successful funding
      if (shouldReopenDrawer) {
        // Increased delay to ensure the Privy modal is fully closed
        setTimeout(() => {
          onOpenChange(true, false); // Pass false for isFunding since it's completed
          setShouldReopenDrawer(false);
        }, 500);
      }
    },
    [onOpenChange, shouldReopenDrawer]
  );

  // Initialize useFundWallet with callbacks
  const { fundWallet, state } = useFundWallet({
    onUserExited: handleUserExitedFunding,
  }) as { fundWallet: any; state: string };

  // Check if funding is in progress
  const isFunding = state === "in-progress";

  // Function to handle drawer close attempts
  const handleDrawerCloseAttempt = (open: boolean) => {
    // If trying to close the drawer while funding is in progress, prevent it
    if (!open && isFunding) {
      console.log("Prevented drawer close during funding process");
      return; // Don't allow closing
    }
    
    // Otherwise, proceed with normal close behavior
    // Pass the funding state to the parent component
    onOpenChange(open, isFunding);
  };

  // Function to handle funding the wallet using Privy's useFundWallet hook
  const handleFundWallet = async () => {
    if (walletAddress) {
      try {
        setFundingExitMessage(null);

        // Close the drawer before opening the funding modal
        onOpenChange(false, true); // Pass true to indicate funding is starting
        // Set flag to reopen drawer when funding flow completes
        setShouldReopenDrawer(true);

        // Fund with SOL
        const result = await fundWallet(walletAddress, {
          asset: "SOL", // Use SOL as the funding asset
          amount: fundingAmount,
          // No need to specify cluster as it uses the default from PrivyProvider config
          uiConfig: {
            receiveFundsTitle: `Receive ${fundingAmount} SOL`,
            receiveFundsSubtitle:
              "Scan this code or copy your wallet address to receive SOL on Solana.",
          },
        });

        // Check if funding was successful
        if (result && result.success) {
          // Call the success handler
          handleFundingSuccess(result);
        }
      } catch (error: any) {
        console.error("Error funding wallet:", error);

        // Provide more specific error messages based on the error type
        if (error.message?.includes("Invalid Solana address")) {
          setFundingExitMessage(
            "Invalid Solana wallet address. Please check your wallet connection."
          );
        } else if (error.message?.includes("cluster")) {
          setFundingExitMessage(
            "Error with Solana network. Please try again later."
          );
        } else {
          setFundingExitMessage(
            "An error occurred while trying to add SOL. Please try again."
          );
        }

        // Reopen the drawer if there was an error
        onOpenChange(true, false); // Pass false since funding failed
        setShouldReopenDrawer(false);
      }
    }
  };

  // Function to calculate USD value from SOL
  const calculateUsdValue = (solAmount: string): string => {
    const amount = parseFloat(solAmount);
    if (isNaN(amount)) return "$0.00";
    
    const usdValue = amount * solPrice;
    return `$${usdValue.toFixed(2)}`;
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerCloseAttempt}
      direction="left"
      title="Add Funding"
      backButton={!isFunding}
      onBack={isFunding ? undefined : onBack}
      icon={<Coins className="h-5 w-5" />}
    >
      <div className="space-y-3">
        <div className="space-y-3">
          <div className="text-sm font-medium mb-2">Add SOL to your wallet</div>
          
          {isFunding && (
            <div className="text-xs text-amber-500 mb-4 p-2 bg-amber-50 rounded-md border border-amber-200">
              Funding in progress. Please don&apos;t close this drawer until the process completes.
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mb-4">
            Select the amount of SOL you want to add to your wallet. You can fund your wallet using a credit card or by transferring SOL from another wallet.
          </div>
          
          {/* Amount selection buttons */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground mb-2">
              Select amount to add:
            </div>
            <div className="flex gap-2">
              {["0.5", "1", "5", "10"].map((amount) => {
                // Calculate USD value for this amount
                const usdValue = (parseFloat(amount) * solPrice).toFixed(2);
                
                return (
                  <Button
                    key={amount}
                    variant={fundingAmount === amount ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFundingAmount(amount)}
                    disabled={isFunding}
                    className="flex-1 flex flex-col py-2 h-auto"
                  >
                    <span>{amount} SOL</span>
                    <span className="text-xs opacity-75 font-bold">${usdValue}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleFundWallet}
            disabled={isFunding || !walletAddress}
            className="w-full mt-5"
            size="lg"
          >
            <Image
              src="/images/sol.avif"
              alt="SOL"
              width={16}
              height={16}
              className="rounded-full mr-2"
            />
            {isFunding ? "Processing..." : (
              <span className="flex items-center gap-5">
                <span>Add {fundingAmount} SOL</span>
                <span className="opacity-50">
                  ${(parseFloat(fundingAmount) * solPrice).toFixed(2)}
                </span>
              </span>
            )}
          </Button>

          {fundingExitMessage && (
            <div className="text-xs text-amber-500 mt-1">
              {fundingExitMessage}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p className="mb-1">💡 <strong>What happens next?</strong></p>
            <p>After clicking the button, you&apos;ll be guided through the funding process. You can choose to fund your wallet with a credit card or by transferring SOL from another wallet.</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
} 