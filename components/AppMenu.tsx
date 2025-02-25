import { useRouter } from "next/router";
import { usePrivy, useLogin, useSolanaWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Menu, WalletMinimal } from "lucide-react";
import Link from "next/link";
import { Drawer } from "@/components/ui/drawer";
import { PageData } from "@/types";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { isSolanaWallet, truncateWalletAddress } from "@/utils/wallet";
import { cn } from "@/lib/utils";
import CreatePageModal from "./CreatePageModal";
import { useGlobalContext } from "@/lib/context";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

type AppMenuProps = {
  className?: string;
  showLogoName?: boolean;
};

type TokenInfo = {
  symbol: string;
  logo: string;
  address: string;
};

const MAIN_TOKENS: TokenInfo[] = [
  {
    symbol: "USDT",
    logo: "/images/usdt.avif",
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  {
    symbol: "SOL",
    logo: "/images/sol.avif",
    address: "So11111111111111111111111111111111111111112",
  },
];

// Helper function to check if page is incomplete
export const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.items || mapping.items.length === 0;
};

// Add this component for the skeleton loading state
const PageSkeleton = () => {
  return (
    <div className="border rounded-md p-2 bg-background">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0 flex-1">
          <Skeleton className="w-10 h-10 rounded-md shrink-0" />
          <div className="space-y-1 min-w-0 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 shrink-0" />
      </div>
    </div>
  );
};

export default function AppMenu({ className }: AppMenuProps) {
  const { ready, authenticated, linkWallet, user, logout, unlinkWallet } =
    usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      // Refresh the page to update the state
      router.replace(router.asPath);
    },
  });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [walletDrawerOpen, setWalletDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllTokens, setShowAllTokens] = useState(false);

  const { userPages, isLoadingPages, tokenHoldings } = useGlobalContext();
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const { exportWallet } = useSolanaWallets();

  useEffect(() => {
    const handleOpenMenu = () => {
      setOpen(true);
    };

    window.addEventListener("openAppMenu", handleOpenMenu);
    return () => {
      window.removeEventListener("openAppMenu", handleOpenMenu);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (ready) {
        setOpen(false);
        setWalletDrawerOpen(false);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, ready]);

  return (
    <div className={className}>
      {/* Menu Trigger Button */}
      <Button
        variant="theme"
        className={cn("px-2")}
        onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Main Menu Drawer */}
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <div className="flex-1 overflow-y-auto p-1">
          <div className="space-y-4">
            <div className="sticky top-0 bg-background z-40 pb-2 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1.5">
                <Logo className="w-5 h-5" />
                <div className="font-bold">page.fun</div>
                <div className="text-xs text-green-500">beta</div>
              </Link>
              {ready && authenticated && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setWalletDrawerOpen(true);
                    }}>
                    <WalletMinimal className="h-4 w-4" />
                    {truncateWalletAddress(solanaWallet?.address)}
                  </Button>
                </div>
              )}
            </div>
            {ready && authenticated && (
              <div className="flex items-center gap-2">
                <div className="text-sm mr-auto">My pages</div>
              </div>
            )}

            {ready && authenticated ? (
              <div className="space-y-4">
                <div>
                  <div className="space-y-3">
                    {isLoadingPages ? (
                      <div className="space-y-3">
                        <PageSkeleton />
                        <PageSkeleton />
                      </div>
                    ) : userPages.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        No pages created yet
                      </div>
                    ) : (
                      userPages
                        .sort(
                          (a, b) => a.title?.localeCompare(b.title || "") || 0
                        )
                        .map((page) => (
                          <div
                            key={page.slug}
                            className="border border-primary rounded-md p-2 bg-background hover:bg-muted transition-colors relative">
                            <Link
                              href={`/${page.slug}`}
                              className="absolute inset-0 z-20"></Link>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3 min-w-0 flex-1">
                                {page.image && (
                                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border">
                                    <img
                                      src={page.image}
                                      alt={page.title || page.slug}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="space-y-1 min-w-0">
                                  <div className="block text-sm font-medium truncate text-primary hover:text-primary/80">
                                    {page.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    page.fun/{page.slug}
                                  </div>
                                </div>
                              </div>
                              <Link href={`/edit/${page.slug}`} passHref>
                                <Button
                                  variant="outline"
                                  className="shrink-0 z-30 relative">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            ) : ready ? (
              <Button onClick={login} className="w-full">
                Sign In
              </Button>
            ) : (
              <>
                <PageSkeleton />
                <PageSkeleton />
              </>
            )}
          </div>
          {ready && authenticated && (
            <div className="pt-5">
              <Button
                className="w-full"
                onClick={() => {
                  setShowCreateModal(true);
                  setOpen(false);
                }}>
                <Plus className="h-4 w-4" />
                New Page
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      {/* Wallet Settings Drawer */}
      <Drawer
        open={walletDrawerOpen}
        onOpenChange={setWalletDrawerOpen}
        direction="left"
        title="Wallet Settings"
        backButton
        onBack={() => {
          setWalletDrawerOpen(false);
          setOpen(true);
        }}>
        <div className="space-y-3">
          {solanaWallet && (
            <>
              <div className="p-4 border bg-muted border-primary rounded-lg space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    <Input readOnly value={solanaWallet.address} />
                  </div>
                </div>

                {solanaWallet.walletClientType === "privy" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        exportWallet({ address: solanaWallet.address })
                      }
                      className="w-full">
                      Export Wallet
                    </Button>

                    <Button
                      variant="outline"
                      onClick={linkWallet}
                      className="w-full">
                      Connect External Wallet
                    </Button>
                  </>
                )}

                {tokenHoldings.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Holdings</div>
                    <div className="space-y-1">
                      {/* Show main tokens first */}
                      {MAIN_TOKENS.map((mainToken) => {
                        const token = tokenHoldings.find(
                          (t) => t.tokenAddress === mainToken.address
                        );

                        return (
                          <div
                            key={mainToken.address}
                            className="flex items-center justify-between text-sm py-1">
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

                      {/* Show other tokens if toggled */}
                      {showAllTokens &&
                        tokenHoldings
                          .filter(
                            (token) =>
                              !MAIN_TOKENS.some(
                                (mt) => mt.address === token.tokenAddress
                              )
                          )
                          .map((token) => (
                            <div
                              key={token.tokenAddress}
                              className="flex justify-between items-center text-sm py-1">
                              <div className="text-muted-foreground truncate pr-4 flex-1">
                                {token.tokenAddress}
                              </div>
                              <div className="font-medium">{token.balance}</div>
                            </div>
                          ))}

                      {/* Toggle button */}
                      {tokenHoldings.length > MAIN_TOKENS.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllTokens(!showAllTokens)}
                          className="w-full mt-2 text-xs">
                          {showAllTokens ? "Show Less" : "Show All Tokens"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                  Logout
                </Button>
                {canRemoveAccount && (
                  <Button
                    variant="outline"
                    onClick={() => unlinkWallet(solanaWallet.address)}
                    className="w-full">
                    Disconnect Wallet
                  </Button>
                )}
              </div>
            </>
          )}
          {!solanaWallet && (
            <Button onClick={linkWallet} className="w-full">
              Connect Wallet
            </Button>
          )}
        </div>
      </Drawer>

      {showCreateModal && solanaWallet && (
        <CreatePageModal
          walletAddress={solanaWallet.address}
          onClose={() => setShowCreateModal(false)}
          open={showCreateModal}
        />
      )}
    </div>
  );
}
