import { useRouter } from "next/router";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Plus, Menu, WalletMinimal, Edit } from "lucide-react";
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
import { WalletDrawer } from "./drawers/WalletDrawer";

type AppMenuProps = {
  className?: string;
  showLogoName?: boolean;
};

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openAppMenuDrawer?: () => void;
  }
}

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
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      // Refresh the page to update the state
      router.replace(router.asPath);
    },
  });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [walletDrawerOpen, setWalletDrawerOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPageOwner, setIsPageOwner] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [isEditPage, setIsEditPage] = useState(false);
  const [isPage, setIsPage] = useState(false);
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  const { userPages, isLoadingPages } = useGlobalContext();
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  useEffect(() => {
    const handleOpenMenu = () => {
      setOpen(true);
    };

    window.addEventListener("openAppMenu", handleOpenMenu);
    return () => {
      window.removeEventListener("openAppMenu", handleOpenMenu);
    };
  }, []);

  // Add a public method to open the menu
  useEffect(() => {
    // Expose a method to open the menu from outside
    window.openAppMenuDrawer = () => {
      setOpen(true);
    };

    return () => {
      // Clean up
      delete window.openAppMenuDrawer;
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

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router, ready]);

  // Check page context - whether we're on a page or edit page
  useEffect(() => {
    // Check if we're on a page
    const isOnPage = router.pathname === "/[page]";
    setIsPage(isOnPage);
    
    // Get the current slug
    let slug = null;
    if (isOnPage) {
      slug = router.query.page as string;
    }
    
    if (slug) {
      setCurrentSlug(slug);
      
      // Find the page in userPages to get the title
      if (userPages && userPages.length > 0) {
        const currentPage = userPages.find((page) => page.slug === slug);
        if (currentPage) {
          setIsPageOwner(true);
          setPageTitle(currentPage.title || slug);
        } else {
          setIsPageOwner(false);
          setPageTitle(null);
        }
      } else {
        setIsPageOwner(false);
        setPageTitle(null);
      }
    } else {
      setCurrentSlug(null);
      setPageTitle(null);
      setIsPageOwner(false);
    }
  }, [router.pathname, router.query, userPages]);

  // Add Edit Button component
  const EditButton = () => {
    if (!currentSlug) return null;

    // Only show edit button on page view (not edit page) and only if user is owner
    if (isPage && isPageOwner) {
      return (
        <Button
          variant="theme"
          onClick={() => router.push(`/edit/${currentSlug}`)}
        >
          <Edit className="h-5 w-5 mr-2" />
          Edit Page
        </Button>
      );
    }

    return null;
  };

  return (
    <div className={className}>
      {/* Menu Trigger Button - Only show when authenticated */}
      {ready && authenticated && (
        <div className="flex items-center gap-2">
          <Button
            variant="theme"
            className={cn("px-2")}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <EditButton />
        </div>
      )}

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
                    }}
                  >
                    <WalletMinimal className="h-4 w-4" />
                    {truncateWalletAddress(solanaWallet?.address)}
                  </Button>
                </div>
              )}
            </div>
            {ready && authenticated && (
              <div className="flex items-center gap-2">
                <div className="text-sm mr-auto">My Pages</div>
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
                            className="border border-primary rounded-md p-2 bg-background hover:bg-muted transition-colors relative"
                          >
                            <Link
                              href={`/${page.slug}`}
                              className="absolute inset-0 z-20"
                            ></Link>
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
                                  className="shrink-0 z-30 relative"
                                >
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
                }}
              >
                <Plus className="h-4 w-4" />
                New Page.fun
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      {/* Use the new WalletDrawer component */}
      <WalletDrawer 
        open={walletDrawerOpen} 
        onOpenChange={setWalletDrawerOpen}
        onBack={() => {
          setWalletDrawerOpen(false);
          setOpen(true);
        }}
      />

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
