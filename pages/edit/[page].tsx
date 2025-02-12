import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import PagePreview from '@/components/PagePreview';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { isSolanaWallet } from '@/utils/wallet';
import { SettingsTabs } from '@/components/SettingsTabs';
import { SaveBar } from '@/components/SaveBar';
import { GOOGLE_FONTS } from '@/lib/fonts';
import { PageData } from '@/types';

interface PageProps {
  slug: string;
  pageData: PageData | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params }) => {
  const slug = params?.page as string;

  try {
    const pageResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/page-store?slug=${slug}`);
    const { mapping } = await pageResponse.json();

    if (!mapping) {
      return {
        props: {
          slug,
          pageData: null,
          error: 'Page not found'
        }
      };
    }

    return {
      props: {
        slug,
        pageData: mapping
      }
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      props: {
        slug,
        pageData: null,
        error: 'Failed to fetch page data'
      }
    };
  }
};

export default function EditPage({ slug, pageData, error }: PageProps) {
  const router = useRouter();
  const { authenticated, user, linkWallet } = usePrivy();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pageDetails, setPageDetails] = useState<PageData | null>(null);
  const [previewData, setPreviewData] = useState<PageData | null>(null);

  // Initialize state after component mounts to prevent hydration mismatch
  useEffect(() => {
    if (pageData) {
      const fonts = {
        global: pageData.fonts?.global || undefined,
        heading: pageData.fonts?.heading || undefined,
        paragraph: pageData.fonts?.paragraph || undefined,
        links: pageData.fonts?.links || undefined
      };
      
      const initialPageData: PageData = {
        ...pageData,
        fonts
      };
      
      setPageDetails(initialPageData);
      setPreviewData(initialPageData);
    }
  }, [pageData]);

  // Update preview data whenever pageDetails changes
  useEffect(() => {
    if (pageDetails) {
      setPreviewData({
        ...pageDetails,
        fonts: {
          ...pageDetails.fonts
        }
      });
    }
  }, [pageDetails]);

  const handleSavePageDetails = async () => {
    if (!pageDetails) return;

    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to save changes.",
        variant: "destructive",
      });
      return;
    }

    const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
    if (!solanaWallet || solanaWallet.address !== pageDetails.walletAddress) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this page.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const items = pageDetails.items?.map((item, index) => {
        // Ensure each item has an id
        const id = item.id || `item-${index}`;
        
        // Format URL based on item type
        let url = item.url;
        if (item.type === 'email' && url && !url.startsWith('mailto:')) {
          url = `mailto:${url}`;
        }
        
        // For plugins, make sure url is undefined/null
        if (item.isPlugin) {
          url = undefined;
        }
        
        return {
          ...item,
          id,
          url,
          order: index,
          // Ensure boolean fields are properly set
          isPlugin: !!item.isPlugin,
          tokenGated: !!item.tokenGated,
          // Only include requiredAmount if tokenGated is true
          ...(item.tokenGated ? { requiredAmount: item.requiredAmount || 0 } : {})
        };
      }) || [];

      const fonts = {
        global: pageDetails.fonts?.global === 'system' ? undefined : pageDetails.fonts?.global,
        heading: pageDetails.fonts?.heading === 'inherit' ? undefined : pageDetails.fonts?.heading,
        paragraph: pageDetails.fonts?.paragraph === 'inherit' ? undefined : pageDetails.fonts?.paragraph,
        links: pageDetails.fonts?.links === 'inherit' ? undefined : pageDetails.fonts?.links
      };

      const requestBody = {
        slug,
        walletAddress: pageDetails.walletAddress,
        title: pageDetails.title,
        description: pageDetails.description,
        image: pageDetails.image,
        items,
        designStyle: pageDetails.designStyle,
        fonts,
        // Only include token-related fields if there's a non-empty connected token
        ...(pageDetails.connectedToken && pageDetails.connectedToken.length > 0 ? {
          connectedToken: pageDetails.connectedToken,
          tokenSymbol: pageDetails.tokenSymbol,
          showToken: pageDetails.showToken,
          showSymbol: pageDetails.showSymbol,
        } : {
          connectedToken: null,  // Explicitly set to null to remove it
          tokenSymbol: null,
          showToken: false,
          showSymbol: false
        }),
        isSetupWizard: false
      };

      const response = await fetch('/api/page-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          // Handle validation errors
          const errorMessage = errorData.details
            .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessage}`);
        }
        throw new Error(errorData.error || 'Failed to save page details');
      }

      toast({
        title: "Changes saved",
        description: "Your page has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving page details:', error);
      toast({
        title: "Error saving changes",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">The page "{slug}" could not be found.</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const canEdit = authenticated && solanaWallet?.address === pageDetails?.walletAddress;

  return (
    <>
      <Head>
        <title>Edit {pageDetails?.title || slug} - Page.fun</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href={`https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(font => font.replace(' ', '+')).join('&family=')}&display=swap`}
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/page.css" />
      </Head>

      <main className="min-h-screen">
        <div>
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[440px] p-0 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="bg-white rounded-lg shadow-sm">
                    <SettingsTabs 
                      pageDetails={pageDetails} 
                      setPageDetails={setPageDetails}
                      isSaving={isSaving}
                      isAuthenticated={authenticated}
                      canEdit={canEdit}
                      onSave={handleSavePageDetails}
                      onConnect={linkWallet}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex">
            {/* Left Column - Settings (Hidden on mobile) */}
            <div className="w-[440px] hidden lg:block space-y-8 border-r border-gray-100 relative">
              <div className="bg-background overflow-y-auto h-screen">
                <SettingsTabs 
                  pageDetails={pageDetails} 
                  setPageDetails={setPageDetails}
                  isSaving={isSaving}
                  isAuthenticated={authenticated}
                  canEdit={canEdit}
                  onSave={handleSavePageDetails}
                  onConnect={linkWallet}
                />
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="pf-preview sticky top-0 right-0 flex-1" style={{ height: 'calc(100vh)' }}>
              {previewData && <PagePreview pageData={previewData} />}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
} 