import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Loader from "./ui/loader";
import { useRouter } from "next/router";
import Link from "next/link";
import TokenSelector from "./TokenSelector";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Card } from "./ui/card";
import debounce from "lodash/debounce";
import { useGlobalContext } from "@/lib/context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type PageType = "personal" | "meme" | "ai-bot";
type Step = "type" | "details";

interface CreatePageModalProps {
  walletAddress: string;
  onClose: () => void;
  open: boolean;
}

export default function CreatePageModal({
  walletAddress,
  onClose,
  open,
}: CreatePageModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userPages, hasPageTokenAccess } = useGlobalContext();
  const [step, setStep] = useState<Step>("type");
  const [pageType, setPageType] = useState<PageType | null>(null);
  const [slug, setSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const [selectedDrawer, setSelectedDrawer] = useState<PageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user can create more pages
  const canCreatePage = hasPageTokenAccess || userPages.length === 0;

  useEffect(() => {
    if (!canCreatePage) {
      toast({
        title: "Page limit reached",
        description:
          `You need to hold at least ${process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN_REQUIRED_HOLDING} PAGE.FUN tokens to create more than one page`,
        variant: "destructive",
      });
      onClose();
    }
  }, [canCreatePage, onClose]);

  const checkSlug = async (value: string) => {
    if (!value) {
      setSlugError("Please enter a custom URL");
      setIsSlugValid(false);
      setIsCheckingSlug(false);
      return;
    }

    try {
      const checkResponse = await fetch(
        `/api/page-store?slug=${encodeURIComponent(value)}`
      );
      const checkData = await checkResponse.json();

      if (checkData.mapping) {
        if (checkData.isOwner) {
          setSlugError("You already own this page");
          setIsSlugValid(false);
        } else {
          setSlugError("This URL is already taken");
          setIsSlugValid(false);
        }
      } else {
        setSlugError("");
        setIsSlugValid(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setSlugError("An error occurred. Please try again.");
      setIsSlugValid(false);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const debouncedCheckSlug = useCallback(
    debounce((value: string) => {
      setIsCheckingSlug(true);
      checkSlug(value);
    }, 300),
    []
  );

  const handleSlugChange = (value: string) => {
    const lowercaseValue = value.toLowerCase();
    setSlug(lowercaseValue);
    setSlugError("");
    setIsSlugValid(false);
    setIsCheckingSlug(true);
    debouncedCheckSlug(lowercaseValue);
  };

  const handleMetadataLoad = (metadata: any) => {
    setTokenMetadata(metadata);
    if (metadata?.symbol) {
      const suggestedSlug = metadata.symbol.toLowerCase();
      setSlug(suggestedSlug);
      setIsCheckingSlug(true);
      checkSlug(suggestedSlug);
    }
  };

  const handleBlur = () => {
    if (slug) {
      checkSlug(slug);
    }
  };

  const handlePageTypeSelect = (type: PageType) => {
    setPageType(type);
    setSelectedDrawer(type);
  };

  const fadeVariants = {
    enter: {
      x: step === "type" ? 0 : 300,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: step === "type" ? 0 : -300,
      opacity: 0,
    },
  };

  // Add this new variant for the container
  const containerVariants = {
    initial: {
      opacity: 1,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const renderPageTypeSelection = () => (
    <div>
      <h2 className="text-lg font-semibold mb-6">Create New Page</h2>
      <div className="grid gap-4">
        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("personal")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Personal</h4>
              <p className="text-sm text-gray-500">
                All your social media links in one place. Gate links & content to token holders and more.
              </p>
            </div>
          </div>
        </Card>

        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("meme")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg
                className="w-5 h-5 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Meme</h4>
              <p className="text-sm text-gray-500">
                Perfect for meme tokens and communities. Token gate links and
                more to reward holders.
              </p>
            </div>
          </div>
        </Card>

        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("ai-bot")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">AI Agent</h4>
              <p className="text-sm text-gray-500">
                Create a page for tokenized AI Agents. Give access to gated content to token holders. Create content using APIs
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPersonalDrawer = () => (
    <div>
      <h2 className="text-lg font-semibold mb-6 pl-12">Create Personal Page</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">page.fun/</span>
            <Input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="your-custom-url"
              pattern="^[a-zA-Z0-9-]+$"
              title="Only letters, numbers, and hyphens allowed"
              required
              className="lowercase"
            />
          </div>
          {slugError && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-red-500">{slugError}</p>
              {slugError === "You already own this page" && (
                <Link
                  href={`/edit/${slug}`}
                  className="text-sm text-blue-500 hover:underline">
                  View page →
                </Link>
              )}
            </div>
          )}
          {isCheckingSlug && (
            <p className="text-sm text-gray-500">
              Checking availability...
            </p>
          )}
          {isSlugValid && (
            <p className="text-sm text-green-500">
              URL is available!
            </p>
          )}
        </div>
      </div>
      {renderSubmitButton()}
    </div>
  );

  const renderTokenBasedDrawer = () => (
    <div>
      <h2 className="text-lg font-semibold mb-6 pl-12">
        {pageType === "meme" ? "Create Meme Page" : "Create AI Bot Page"}
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Enter Token Address
        </label>
        <TokenSelector
          selectedToken={selectedToken}
          onTokenSelect={(tokenAddress) => {
            setSelectedToken(tokenAddress || null);
            if (!tokenAddress) {
              setTokenMetadata(null);
              setSlug("");
              setIsSlugValid(false);
              setSlugError("");
            }
          }}
          onMetadataLoad={handleMetadataLoad}
        />
      </div>

      {tokenMetadata && (
        <div className="flex gap-5 items-start">
          <div className="space-y-2 flex-1 order-2">
            <div>
              <label className="block text-xs text-gray-500">
                Title
              </label>
              <p className="text-sm font-medium">
                {tokenMetadata.name || "My Page"}
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500">
                Description
              </label>
              <p className="text-sm text-gray-700 line-clamp-3">
                {tokenMetadata.description ||
                  "A page for my community"}
              </p>
            </div>
            {tokenMetadata.symbol && (
              <div>
                <label className="block text-xs text-gray-500">
                  Token Symbol
                </label>
                <p className="text-sm font-medium">
                  {tokenMetadata.symbol}
                </p>
              </div>
            )}
          </div>
          {tokenMetadata.image && (
            <img
              src={tokenMetadata.image}
              alt={tokenMetadata.name}
              className="object-cover w-24 h-24 shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display =
                  "none";
              }}
            />
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">page.fun/</span>
            <Input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={
                tokenMetadata?.symbol
                  ? tokenMetadata.symbol.toLowerCase()
                  : "your-custom-url"
              }
              pattern="^[a-zA-Z0-9-]+$"
              title="Only letters, numbers, and hyphens allowed"
              required
              className="lowercase"
            />
          </div>
          {slugError && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-red-500">{slugError}</p>
              {slugError === "You already own this page" && (
                <Link
                  href={`/edit/${slug}`}
                  className="text-sm text-blue-500 hover:underline">
                  View page →
                </Link>
              )}
            </div>
          )}
          {isCheckingSlug && (
            <p className="text-sm text-gray-500">
              Checking availability...
            </p>
          )}
          {isSlugValid && (
            <p className="text-sm text-green-500">
              URL is available!
            </p>
          )}
        </div>
      </div>
      {renderSubmitButton()}
    </div>
  );

  const handleSubmit = async () => {
    if (!canCreatePage) {
      toast({
        title: "Page limit reached",
        description:
          `You need to hold at least ${process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN_REQUIRED_HOLDING} PAGE.FUN tokens to create more than one page`,
        variant: "destructive",
      });
      return;
    }

    if (!isSlugValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/page-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          walletAddress,
          title: tokenMetadata?.name || "My Page",
          description: tokenMetadata?.description || "A page for my community",
          image: tokenMetadata?.image || null,
          designStyle: "default",
          connectedToken: selectedToken || null,
          tokenSymbol: tokenMetadata?.symbol || null,
          pageType,
          items: [],
          fonts: {
            global: "",
            heading: "",
            paragraph: "",
            links: "",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
        toast({
          title: "Error creating page",
          description: data.error || data.message || "Failed to create page",
          variant: "destructive",
        });
        return;
      }

      // Close modal before redirecting
      onClose();

      // Redirect to edit page
      router.push(`/edit/${slug}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmitButton = () => (
    <div className="flex justify-end pt-4">
      <Button
        onClick={handleSubmit}
        disabled={!isSlugValid || isSubmitting || (pageType !== "personal" && !selectedToken)}>
        {isSubmitting ? (
          <>
            <Loader className="h-4 w-4 mr-2" />
            Creating...
          </>
        ) : (
          "Create Page"
        )}
      </Button>
    </div>
  );

  if (!canCreatePage) {
    return null;
  }

  return (
    <>
      <Drawer 
        open={open && !selectedDrawer} 
        onOpenChange={(isOpen: boolean) => !isOpen && onClose()}
        direction="left"
      >
        <DrawerContent direction="left">
          {userPages.length > 0 && !hasPageTokenAccess && (
            <p className="text-sm text-amber-600 mb-4">
              Note: You need to hold at least {process.env.NEXT_PUBLIC_PAGE_DOT_FUN_TOKEN_REQUIRED_HOLDING} PAGE.FUN tokens to create
              more than one page
            </p>
          )}
          {renderPageTypeSelection()}
        </DrawerContent>
      </Drawer>

      <Drawer
        open={selectedDrawer === "personal"}
        onOpenChange={(isOpen: boolean) => !isOpen && setSelectedDrawer(null)}
        direction="left"
      >
        <DrawerContent 
          direction="left"
          showBackButton
          onBack={() => setSelectedDrawer(null)}
        >
          {renderPersonalDrawer()}
        </DrawerContent>
      </Drawer>

      <Drawer
        open={selectedDrawer === "meme" || selectedDrawer === "ai-bot"}
        onOpenChange={(isOpen: boolean) => !isOpen && setSelectedDrawer(null)}
        direction="left"
      >
        <DrawerContent 
          direction="left"
          showBackButton
          onBack={() => setSelectedDrawer(null)}
        >
          {renderTokenBasedDrawer()}
        </DrawerContent>
      </Drawer>
    </>
  );
}
