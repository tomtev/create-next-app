import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TokenSelector from "@/components/TokenSelector";
import { PageData } from "@/types";
import { useRef, useEffect, useState } from "react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface GeneralSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  focusField?: 'title' | 'description' | 'image';
}

export function GeneralSettingsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
  focusField,
}: GeneralSettingsDrawerProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tokenizeEnabled, setTokenizeEnabled] = useState<boolean>(!!pageDetails?.connectedToken);

  // Focus the correct field when the component mounts
  useEffect(() => {
    if (!focusField || !open) return;

    setTimeout(() => {
      if (focusField === 'title' && titleInputRef.current) {
        titleInputRef.current.focus();
      } else if (focusField === 'description' && descriptionInputRef.current) {
        descriptionInputRef.current.focus();
      } else if (focusField === 'image' && imageInputRef.current) {
        imageInputRef.current.focus();
      }
    }, 100); // Small delay to ensure drawer is fully open
  }, [focusField, open]);

  // Update tokenizeEnabled when pageDetails changes
  useEffect(() => {
    setTokenizeEnabled(!!pageDetails?.connectedToken);
  }, [pageDetails?.connectedToken]);

  // Handle tokenize toggle
  const handleTokenizeToggle = (checked: boolean) => {
    setTokenizeEnabled(checked);
    
    // If toggled off, clear token data
    if (!checked && pageDetails?.connectedToken) {
      setPageDetails((prev) =>
        prev
          ? {
              ...prev,
              connectedToken: null,
              tokenSymbol: null,
            }
          : null
      );
    }
  };

  // Handle unlink token
  const handleUnlinkToken = () => {
    setPageDetails((prev) =>
      prev
        ? {
            ...prev,
            connectedToken: null,
            tokenSymbol: null,
          }
        : null
    );
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      hasContainer
      title="General Settings"
      icon={<Settings className="h-5 w-5" />}
      closeButton>
      <div className="space-y-5 pb-5">
        <div className="flex items-start gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <ImageUploader
              imageUrl={pageDetails?.image || null}
              onImageChange={(url) => 
                setPageDetails((prev) =>
                  prev
                    ? {
                        ...prev,
                        image: url,
                      }
                    : null
                )
              }
              previewSize={64}
              label=""
              ref={imageInputRef}
              helpText=""
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              ref={titleInputRef}
              type="text"
              value={pageDetails?.title || ""}
              onChange={(e) =>
                setPageDetails((prev) =>
                  prev
                    ? {
                        ...prev,
                        title: e.target.value,
                      }
                    : null
                )
              }
              maxLength={100}
            />
            <p className="mt-2 text-xs text-gray-500">
              https://page.fun/{pageDetails?.slug || ""}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            ref={descriptionInputRef}
            value={pageDetails?.description || ""}
            onChange={(e) =>
              setPageDetails((prev) =>
                prev
                  ? {
                      ...prev,
                      description: e.target.value,
                    }
                  : null
              )
            }
            rows={3}
            maxLength={500}
          />
        </div>

        {!pageDetails?.connectedToken && (
          <div className="space-y-2 border-t pt-5">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tokenize" 
                checked={tokenizeEnabled}
                onCheckedChange={handleTokenizeToggle}
              />
              <label
                htmlFor="tokenize"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tokenize page
              </label>
            </div>
            <p className="text-sm text-gray-500 ml-6">
              Token gate links and more by connecting a Solana token.
            </p>
          </div>
        )}

        {(tokenizeEnabled || pageDetails?.connectedToken) && pageDetails && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Connected Token
            </label>
            <div className="space-y-4">
              {pageDetails.connectedToken ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={pageDetails.connectedToken}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        onClick={handleUnlinkToken}>
                        Unlink
                      </Button>
                    </div>
                    {pageDetails.tokenSymbol && (
                      <p className="mt-1 text-sm text-gray-500">
                        ${pageDetails.tokenSymbol}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <TokenSelector
                  selectedToken={null}
                  onTokenSelect={(tokenAddress) => {
                    if (!tokenAddress) {
                      setPageDetails((prev) =>
                        prev
                          ? {
                              ...prev,
                              connectedToken: null,
                              tokenSymbol: null,
                            }
                          : null
                      );
                      return;
                    }
                    setPageDetails((prev) =>
                      prev
                        ? {
                            ...prev,
                            connectedToken: tokenAddress,
                          }
                        : null
                    );
                  }}
                  onMetadataLoad={(metadata) => {
                    if (!metadata) {
                      setPageDetails((prev) =>
                        prev
                          ? {
                              ...prev,
                              tokenSymbol: null,
                            }
                          : null
                      );
                      return;
                    }
                    setPageDetails((prev) =>
                      prev
                        ? {
                            ...prev,
                            // Don't replace title, description, or image
                            tokenSymbol: metadata.symbol || null,
                          }
                        : null
                    );
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
} 