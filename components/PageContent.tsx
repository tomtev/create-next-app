"use client";

import { useState, useRef, useEffect } from "react";
import { PageData, PageItem } from "@/types";
import Link from "next/link";
import PageLink from "./PageLink";
import { ThemeConfig } from "@/lib/themes";

interface PageContentProps {
  pageData: PageData;
  items?: PageItem[];
  themeStyle?: ThemeConfig;
}

export default function PageContent({
  pageData,
  items = pageData?.items || [],
  themeStyle,
}: PageContentProps) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [accessStates, setAccessStates] = useState<Map<string, boolean>>(
    new Map()
  );
  const [tokenGatedUrls, setTokenGatedUrls] = useState<Map<string, string>>(
    new Map()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    const detectTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    
    setIsTouchDevice(detectTouchDevice());
  }, []);

  // Apply luminance effect to the page container when enabled
  useEffect(() => {
    if (!themeStyle?.effects?.luminance) return;
    
    // Only load the effect if needed
    const loadLuminanceEffect = async () => {
      try {
        // Dynamically import the luminance effect
        const { createLuminanceEffect } = await import('@/lib/luminanceEffect');
        
        // Apply to container only on touch devices
        if (isTouchDevice && containerRef.current) {
          return createLuminanceEffect(containerRef.current, true);
        }
      } catch (error) {
        console.error('Failed to load luminance effect:', error);
      }
    };
    
    // Use requestIdleCallback or setTimeout to defer non-critical operations
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          loadLuminanceEffect();
        });
      } else {
        setTimeout(loadLuminanceEffect, 1000);
      }
    }
  }, [themeStyle?.effects?.luminance, isTouchDevice]);

  // Request device orientation permission on page load for iOS devices
  useEffect(() => {
    if (!themeStyle?.effects?.luminance) return;
    
    const requestOrientationPermission = async () => {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          console.log('Device orientation permission:', permission);
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    };
    
    if (typeof window !== 'undefined' && isTouchDevice) {
      // Request permission after a short delay to ensure the page has loaded
      setTimeout(() => {
        requestOrientationPermission();
      }, 1000);
    }
  }, [themeStyle?.effects?.luminance, isTouchDevice]);

  const fetchTokenGatedContent = async (itemId: string) => {
    try {
      const response = await fetch("/api/token-gated-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: window.location.pathname.slice(1),
          itemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Token gated content error:", {
          status: response.status,
          data,
          itemId,
          slug: window.location.pathname.slice(1),
        });
        return;
      }

      if (data.url) {
        setTokenGatedUrls((prev) => new Map(prev).set(itemId, data.url));
      }
    } catch (error) {
      console.error("Error fetching token gated content:", error);
    }
  };

  const verifyAccess = async (
    itemId: string,
    tokenAddress: string,
    requiredAmount: string
  ) => {
    setVerifying(itemId);
    try {
      const response = await fetch("/api/verify-token-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenAddress,
          requiredAmount,
          slug: window.location.pathname.slice(1),
        }),
      });

      const data = await response.json();

      setAccessStates((prev) => new Map(prev).set(itemId, data.hasAccess));

      if (data.hasAccess) {
        await fetchTokenGatedContent(itemId);
      }
    } catch (error) {
      console.error("Error verifying access:", error);
      setAccessStates((prev) => new Map(prev).set(itemId, false));
    } finally {
      setVerifying(null);
    }
  };

  const handleTokenGatedClick = async (item: PageItem) => {
    if (!item.requiredTokens?.[0] || !pageData.connectedToken) return;

    setOpenDrawer(item.id);
    await verifyAccess(
      item.id,
      pageData.connectedToken,
      item.requiredTokens[0]
    );
  };

  return (
    <div className="pf-page__container" ref={containerRef}>
      {/* Page Header */}
      <div className="pf-page__header">
        <div className="pf-page__header-inner">
          {pageData?.image && (
            <img
              className="pf-page__image"
              src={pageData.image}
              alt={pageData.title || "Page image"}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <h1
            className={`pf-page__title ${
              themeStyle?.effects?.titleGradientBackground
                ? "pf-page__title--has-gradient"
                : ""
            }`}>
            <span>{pageData?.title || "Untitled Page"}</span>
          </h1>
          {pageData?.description && (
            <p
              className={`pf-page__description ${
                themeStyle?.effects?.descriptionGradientBackground
                  ? "pf-page__description--has-gradient"
                  : ""
              }`}>
              <span>{pageData.description}</span>
            </p>
          )}
        </div>
      </div>

      {/* Social Links & Plugins */}
      {items && items.length > 0 && (
        <div className="pf-links">
          <div className="pf-links__grid">
            {items
              .filter((item) => item && item.id && item.presetId)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <PageLink
                  key={item.id}
                  item={item}
                  pageData={pageData}
                  openDrawer={openDrawer}
                  setOpenDrawer={setOpenDrawer}
                  verifying={verifying}
                  accessStates={accessStates}
                  tokenGatedUrls={tokenGatedUrls}
                  onTokenGatedClick={handleTokenGatedClick}
                  onVerifyAccess={verifyAccess}
                  themeStyle={themeStyle}
                  enableLuminance={themeStyle?.effects?.luminance && !isTouchDevice}
                />
              ))}
          </div>
        </div>
      )}
      <div className="flex mt-10 items-center justify-center gap-1 text-sm opacity-50 hover:opacity-100 transition-opacity">
        <Link href="/" className="flex items-center gap-0.5">
          <span>page.fun</span>
          <span className="opacity-50"> / </span>
          <span>{pageData.slug}</span>
        </Link>
      </div>
    </div>
  );
}
