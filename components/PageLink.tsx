import { useRef, useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { PageItem, PageData } from "@/types";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { ThemeConfig } from "@/lib/themes";
import { EllipsisVertical } from "lucide-react";

// Dynamically import non-critical components
const Loader = dynamic(() => import("@/components/ui/loader"), { ssr: false });
const ShareDrawer = dynamic(() => import("@/components/ShareDrawer"), { ssr: false });

interface PageLinkProps {
  item: PageItem;
  pageData: PageData;
  isLoading?: boolean;
  onLinkClick?: (itemId: string) => void;
  isPreview?: boolean;
  themeStyle?: ThemeConfig;
  openDrawer?: string | null;
  setOpenDrawer?: (id: string | null) => void;
  verifying?: string | null;
  accessStates?: Map<string, boolean>;
  tokenGatedUrls?: Map<string, string>;
  onTokenGatedClick?: (item: PageItem) => void;
  onVerifyAccess?: (itemId: string, tokenAddress: string, requiredAmount: string) => void;
  enableLuminance?: boolean;
}

// Helper to track link clicks
async function trackClick(slug: string, itemId: string, isGated: boolean) {
  try {
    await fetch("/api/analytics/track-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug,
        itemId,
        isGated,
      }),
    });
  } catch (error) {
    console.error("Failed to track click:", error);
  }
}

export default function PageLink({
  item,
  pageData,
  isLoading = false,
  onLinkClick,
  isPreview = false,
  themeStyle,
  openDrawer,
  setOpenDrawer,
  verifying,
  accessStates,
  tokenGatedUrls,
  onTokenGatedClick,
  onVerifyAccess,
  enableLuminance = false,
}: PageLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLDivElement>(null);
  const { page } = router.query;
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [isGatedLinkLoading, setIsGatedLinkLoading] = useState(false);

  // Defer luminance effect initialization
  useEffect(() => {
    // Skip effect if luminance is disabled in theme or not enabled for this link
    if (!themeStyle?.effects?.luminance || !enableLuminance) return;

    // Dynamically import the luminance effect only when needed
    let cleanup: (() => void) | undefined;
    
    const loadLuminanceEffect = async () => {
      try {
        const { createLuminanceEffect } = await import('@/lib/luminanceEffect');
        cleanup = createLuminanceEffect(linkRef.current, true);
      } catch (error) {
        console.error('Failed to load luminance effect:', error);
      }
    };
    
    // Use requestIdleCallback or setTimeout to defer non-critical operations
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loadLuminanceEffect();
      });
    } else {
      setTimeout(loadLuminanceEffect, 1000);
    }
    
    return () => cleanup?.();
  }, [themeStyle?.effects?.luminance, enableLuminance]);

  // Reset loading state when navigating away
  useEffect(() => {
    // Listen for route changes to reset loading state
    const handleRouteChange = () => {
      setIsGatedLinkLoading(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const handleClick = async (e: React.MouseEvent) => {
    if (isPreview && onLinkClick) {
      e.preventDefault();
      onLinkClick(item.id);
      return;
    }

    // Set loading state for gated links
    if (item.tokenGated && pageData.connectedToken) {
      setIsGatedLinkLoading(true);
    }

    // Track click
    await trackClick(page as string, item.id, item.tokenGated || false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareDrawerOpen(true);
  };

  // Check if token gating should be shown
  const showTokenGating = item.tokenGated && pageData.connectedToken;

  const itemContent = (
    <div className={`pf-link relative ${themeStyle?.effects?.linkPixelBorder ? 'pf-link--has-pixel-border' : ''}`} ref={linkRef}>
      <div className="pf-link__inner">
        <div className="pf-link__icon-container">
          <div className="pf-link__icon">
            {isLoading ? (
              <Loader className="h-4 w-4" />
            ) : item.customIcon ? (
              <>
                <img 
                  src={item.customIcon} 
                  alt={item.title || preset.title} 
                  className="pf-link__custom-icon"
                  onError={(e) => {
                    // Fallback to preset icon if custom icon fails to load
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <preset.icon className="pf-link__icon hidden" aria-hidden="true" />
              </>
            ) : (
              <preset.icon className="pf-link__icon" aria-hidden="true" />
            )}
          </div>
        </div>
        <div className="pf-link__title">
          <span className="pf-link__title-text flex items-center">
            {item.title || preset.title}
            {isGatedLinkLoading && showTokenGating && (
              <Loader className="ml-2 h-4 w-4" />
            )}
          </span>
        </div>
        <div className="pf-link__icon-container flex items-center justify-end">
          {showTokenGating && !isLoading && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="pf-link__icon-lock flex-shrink-0 opacity-75 w-5 h-5">
              <path
                fillRule="evenodd"
                d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <button 
            onClick={handleShareClick}
            className="pf-link__share-button flex-shrink-0 flex items-center justify-center w-10 h-[var(--pf-link-min-height)] -mr-4 group focus:outline-none"
            aria-label="Share"
          >
            <EllipsisVertical className="h-3 w-3 opacity-50 group-hover:opacity-100 transition" />
          </button>
        </div>
      </div>
      {themeStyle?.effects?.linkGradientBorder && enableLuminance && (
        <div
          className="pf-gradient-border pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            ['--pf-gradient-border' as string]: `${
              themeStyle?.styles?.["--pf-gradient-border"]
            }`
          }}>
          <div className="pf-gradient-border__inner absolute inset-0 rounded-[inherit]"></div>
        </div>
      )}

      {themeStyle?.effects?.linkPixelBorder && (
        <div
          className="pf-pixel-border absolute pointer-events-none inset-0"
          style={{
            borderImageSource: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${
                themeStyle?.styles?.["--pf-pixel-border-color"] ||
                "rgb(33,37,41)"
              }"/></svg>`
            )}")`,
          }}
        />
      )}
      
      <ShareDrawer 
        item={item} 
        open={shareDrawerOpen} 
        onOpenChange={setShareDrawerOpen} 
        pageSlug={page as string} 
      />
    </div>
  );

  if (showTokenGating) {
    // Use Next.js Link for gated content with the current page slug
    return (
      <Link href={`/${page}/url/${item.id}`} onClick={handleClick} className="w-full">
        {itemContent}
      </Link>
    );
  }

  // For external links, use regular anchor tags
  if (!item.url) {
    return (
      <div className="w-full">
        {itemContent}
      </div>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-full">
      {itemContent}
    </a>
  );
}
