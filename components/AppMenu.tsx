import { useRouter } from "next/router";
import { usePrivy, useLogin, useSolanaWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Plus, Menu, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageData } from "@/types";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { isSolanaWallet, truncateWalletAddress } from "@/utils/wallet";
import { cn } from "@/lib/utils";
import CreatePageModal from "./CreatePageModal";
import { useGlobalContext } from "@/lib/context";
import Spinner from "./Spinner";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AppMenuProps = {
  className?: string;
  showLogoName?: boolean;
};

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

export default function AppMenu({
  className,
  showLogoName = false,
}: AppMenuProps) {
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

  const { userPages, isLoadingPages, hasPageTokenAccess, tokenHoldings } = useGlobalContext();
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const { exportWallet } = useSolanaWallets();

  // Close sheet on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setOpen(false);
      setWalletDrawerOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const handleOpenMenu = () => {
      setOpen(true);
    };

    window.addEventListener("openAppMenu", handleOpenMenu);
    return () => {
      window.removeEventListener("openAppMenu", handleOpenMenu);
    };
  }, []);

  // Add loading state tracking
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <div className={className}>
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline" className={cn("px-2 bg-[var(--pf-link-background)] text-[var(--pf-link-color)] border-width-[var(--pf-link-border-width)] border-[var(--pf-link-border-color)]")}>
            {isLoading ? <Spinner /> : <Menu className="h-5 w-5" />}
          </Button>
        </DrawerTrigger>
        <DrawerContent direction="left">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="sticky top-0 bg-background z-40 pb-2 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1.5">
                  <Logo className="w-5 h-5" />
                  <div className="font-bold">page.fun</div>
                  <div className="text-xs text-green-500">beta</div>
                </Link>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      setWalletDrawerOpen(true);
                    }}>
                    {truncateWalletAddress(solanaWallet?.address)}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm mr-auto">Your pages</div>
              </div>

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
                                    size="sm"
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
            <div className="py-5">
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowCreateModal(true);
                  setOpen(false);
                }}>
                <Plus className="h-4 w-4" />
                New Page
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={walletDrawerOpen}
        onOpenChange={setWalletDrawerOpen}
        direction="left">
        <DrawerContent direction="left">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="sticky top-0 bg-background z-40 pb-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setWalletDrawerOpen(false);
                    setOpen(true);
                  }}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="font-bold">Wallet Settings</div>
              </div>

              <div className="space-y-3">
                {solanaWallet && (
                  <>
                    <div className="p-4 border rounded-lg space-y-3">
                      <Tabs defaultValue="wallet" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="wallet">Wallet</TabsTrigger>
                          <TabsTrigger value="tokens">Tokens</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="wallet" className="space-y-3">
                          <div>
                            <div className="text-sm font-medium mb-1">
                              Connected Wallet
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {solanaWallet.address}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportWallet({ address: solanaWallet.address })}
                            className="w-full">
                            Export Wallet
                          </Button>
                        </TabsContent>
                        
                        <TabsContent value="tokens" className="space-y-3">
                          {tokenHoldings.length > 0 ? (
                            <div className="space-y-1.5">
                              {tokenHoldings.map((token) => (
                                <div key={token.tokenAddress} className="flex justify-between items-center text-sm py-1">
                                  <div className="text-muted-foreground truncate pr-4 flex-1">
                                    {token.tokenAddress}
                                  </div>
                                  <div className="font-medium">{token.balance}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No tokens found
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      <p>Pages are owned by the wallet that created them. You need access to the creator wallet to edit a page.</p>
                      <p className="mt-1">In the future, wallets will be used to pay and get paid for page services.</p>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="w-full shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        Logout
                      </Button>
                      {canRemoveAccount && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unlinkWallet(solanaWallet.address)}
                          className="w-full">
                          Disconnect Wallet
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={linkWallet}
                        className="w-full">
                        Connect External Wallet
                      </Button>
                    </div>
                  </>
                )}
                {!solanaWallet && (
                  <Button onClick={linkWallet} className="w-full">
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
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
