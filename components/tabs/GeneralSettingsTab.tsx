import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TokenSelector from "@/components/TokenSelector";
import { PageData } from "@/types";
import { useRef, useEffect, useState } from "react";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface GeneralSettingsTabProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  focusField?: 'title' | 'description' | 'image';
}

export function GeneralSettingsTab({
  pageDetails,
  setPageDetails,
  focusField,
}: GeneralSettingsTabProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Focus the correct field when the component mounts
  useEffect(() => {
    if (!focusField) return;

    setTimeout(() => {
      if (focusField === 'title' && titleInputRef.current) {
        titleInputRef.current.focus();
      } else if (focusField === 'description' && descriptionInputRef.current) {
        descriptionInputRef.current.focus();
      } else if (focusField === 'image' && imageInputRef.current) {
        imageInputRef.current.focus();
      }
    }, 100); // Small delay to ensure drawer is fully open
  }, [focusField]);

  return (
    <div className="space-y-4">
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
        />
      </div>

      <div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Connected Token
        </label>
        {pageDetails && (
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
                      onClick={() => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                connectedToken: null,
                                tokenSymbol: null,
                              }
                            : null
                        );
                      }}>
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
        )}
      </div>
    </div>
  );
}
