import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import PageContent from "../components/PageContent";
import { PageData, PageItem } from "@/types";
import { themes } from "@/lib/themes";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { PrivyClient } from "@privy-io/server-auth";
import Loader from "@/components/ui/loader";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useThemeStyles } from '@/hooks/use-theme-styles';
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure neon to use fetch
neonConfig.fetchConnectionCache = true;

// Initialize Prisma client with Neon adapter
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

// Dynamically import child routes
const ProfilePage = dynamic(() => import("./[page]/profile"), {
  loading: () => (
    <div className="p-4">
      <Loader />
    </div>
  ),
  ssr: false,
});

interface PageProps {
  pageData: PageData;
  slug: string;
  error?: string;
  isOwner: boolean;
}

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const privyClient = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Helper to generate a visitor ID
function generateVisitorId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to get or create visitor ID
function getVisitorId() {
  if (typeof window === "undefined") return null;

  let visitorId = localStorage.getItem("visitorId");
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem("visitorId", visitorId);
  }
  return visitorId;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  req,
}) => {
  const slug = params?.page as string;

  try {
    // Get page data from Prisma
    const pageData = await prisma.page.findUnique({
      where: { slug },
      include: {
        items: true,
      },
    });

    if (!pageData) {
      const defaultPageData: PageData = {
        walletAddress: "",
        slug,
        createdAt: new Date().toISOString(),
        pageType: "personal",
        theme: "default",
        themeFonts: {
          global: null,
          heading: null,
          paragraph: null,
          links: null,
        },
        themeColors: {
          primary: null,
          secondary: null,
          background: null,
          text: null,
        },
        items: [],
      };

      return {
        props: {
          slug,
          pageData: defaultPageData,
          isOwner: false,
          error: "Page not found",
        },
      };
    }

    // Check ownership if we have an identity token
    let isOwner = false;
    const idToken = req.cookies["privy-id-token"];

    if (idToken) {
      try {
        const user = await privyClient.getUser({ idToken });

        // Check if the wallet is in user's linked accounts
        for (const account of user.linkedAccounts) {
          if (account.type === "wallet" && account.chainType === "solana") {
            const walletAccount = account as { address?: string };
            if (
              walletAccount.address?.toLowerCase() ===
              pageData.walletAddress.toLowerCase()
            ) {
              isOwner = true;
              break;
            }
          }
        }
      } catch (error) {
        console.log("User does not own page:", error);
      }
    }

    // Process the page data to match our PageData interface
    const processedData: PageData = {
      id: pageData.id,
      walletAddress: pageData.walletAddress,
      slug: pageData.slug,
      connectedToken: pageData.connectedToken || null,
      tokenSymbol: pageData.tokenSymbol || null,
      title: pageData.title || null,
      description: pageData.description || null,
      image: pageData.image || null,
      pageType: pageData.pageType || "personal",
      theme: pageData.theme || "default",
      themeFonts: pageData.themeFonts ? JSON.parse(pageData.themeFonts as string) : {
        global: null,
        heading: null,
        paragraph: null,
        links: null,
      },
      themeColors: pageData.themeColors ? JSON.parse(pageData.themeColors as string) : {
        primary: null,
        secondary: null,
        background: null,
        text: null,
      },
      items: pageData.items.map(item => ({
        id: item.id,
        pageId: item.pageId,
        presetId: item.presetId,
        title: item.title,
        url: item.tokenGated && !isOwner ? null : (item.url || null),
        order: item.order || 0,
        tokenGated: item.tokenGated,
        requiredTokens: item.requiredTokens,
      })),
      createdAt: pageData.createdAt.toISOString(),
      updatedAt: pageData.updatedAt.toISOString(),
    };

    return {
      props: {
        slug,
        pageData: processedData,
        isOwner,
      },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    const defaultPageData: PageData = {
      walletAddress: "",
      slug,
      createdAt: new Date().toISOString(),
      pageType: "personal",
      theme: "default",
      themeFonts: {
        global: null,
        heading: null,
        paragraph: null,
        links: null,
      },
      themeColors: {
        primary: null,
        secondary: null,
        background: null,
        text: null,
      },
      items: [],
    };

    return {
      props: {
        slug,
        pageData: defaultPageData,
        isOwner: false,
        error: "Failed to fetch page data",
      },
    };
  }
};

export default function Page({ pageData, slug, error, isOwner }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pageDetails, setPageDetails] = useState<PageData>(pageData);
  const [previewData, setPreviewData] = useState<PageData>(pageData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check if this is being rendered from a child route
  const isChildRoute = router.pathname.includes("[page]/");

  // Handle drawer routes
  useEffect(() => {
    if (isChildRoute) return;
    const childRoute = router.asPath.split("/").slice(2)[0];
    setIsDrawerOpen(!!childRoute);
  }, [router.asPath, isChildRoute]);

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    router.back();
  };

  useEffect(() => {
    if (pageData) {
      const currentTheme = pageData.theme || "default";
      const themePreset = themes[currentTheme];

      const fonts = pageData.themeFonts || {
        global: themePreset?.fonts?.global || "Inter",
        heading: themePreset?.fonts?.heading || "Inter",
        paragraph: themePreset?.fonts?.paragraph || "Inter",
        links: themePreset?.fonts?.links || "Inter",
      };

      const initialPageData: PageData = {
        ...pageData,
        theme: currentTheme,
        themeFonts: fonts,
      };

      setPageDetails(initialPageData);
      setPreviewData(initialPageData);
    }
  }, [pageData]);

  // Track page visit
  useEffect(() => {
    const trackVisit = async () => {
      const visitorId = getVisitorId();
      if (!visitorId) return;

      try {
        await fetch("/api/analytics/track-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug,
            visitorId,
          }),
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, [slug]);

  // Process page data with token replacements
  const processedPageData: PageData = {
    ...pageData,
    items: pageData.items?.map((item) => ({
      ...item,
      url: item.url 
        ? item.url.replace("[token]", pageData.connectedToken || "") 
        : null,
    })),
  };

  const { cssVariables, googleFontsUrl, themeConfig } = useThemeStyles(processedPageData);

  // Get the current child route for drawer content
  const childRoute = router.asPath.split("/").slice(2)[0];

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">
            The page &quot;{slug}&quot; could not be found.
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{processedPageData?.title || slug} - Page.fun</title>
        {processedPageData?.description && (
          <meta name="description" content={processedPageData.description} />
        )}

        {googleFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link href={googleFontsUrl} rel="stylesheet" />
          </>
        )}
        <style>{cssVariables}</style>
      </Head>

      <div className="pf-page">
        <PageContent
          pageData={processedPageData}
          items={processedPageData.items}
          themeStyle={themeConfig}
        />
      </div>

      {isOwner && (
        <Button
          size="icon"
          variant="theme"
          className="fixed top-2 right-2"
          onClick={async () => {
            setIsLoading(true);
            await router.push(`/edit/${slug}`);
          }}
          disabled={isLoading}>
          {isLoading ? (
            <Loader className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      )}

      {!isChildRoute && (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (!open) handleDrawerClose();
          }}
          direction="bottom">
          <DrawerContent className="h-full">
            <Suspense
              fallback={
                <div className="p-4">
                  <Loader />
                </div>
              }>
              {childRoute === "profile" && (
                <ProfilePage
                  pageData={pageData}
                  slug={slug}
                  isOwner={isOwner}
                  error={error}
                />
              )}
            </Suspense>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
