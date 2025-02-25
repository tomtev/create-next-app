import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TokenSelector from "@/components/TokenSelector";
import { PageData } from "@/types";
import { useRef, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import type { PutBlobResult } from '@vercel/blob';
import Loader from "@/components/ui/loader";

interface GeneralSettingsTabProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  focusField?: 'title' | 'description' | 'image';
}

// Helper function to resize image to a square
const resizeImage = (file: File, size: number, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Create a square canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate the square crop
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        
        // If the image is wider than tall, crop the sides
        if (img.width > img.height) {
          sourceWidth = img.height;
          sourceX = (img.width - img.height) / 2;
        } 
        // If the image is taller than wide, crop the top and bottom
        else if (img.height > img.width) {
          sourceHeight = img.width;
          sourceY = (img.height - img.width) / 2;
        }
        
        // Draw the cropped image onto the square canvas
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
          0, 0, size, size // Destination rectangle
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          
          // Create a new file from the blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          resolve(resizedFile);
        }, file.type, quality);
      };
      img.onerror = (error) => {
        reject(error);
      };
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export function GeneralSettingsTab({
  pageDetails,
  setPageDetails,
  focusField,
}: GeneralSettingsTabProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resizeOptions, setResizeOptions] = useState({
    size: 200,
    quality: 0.8,
  });

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      return;
    }
    
    // Check if the original file is too large (over 5MB) before even trying to resize
    const MAX_ORIGINAL_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_ORIGINAL_SIZE) {
      alert(`File is too large. Please select an image under 5MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setIsUploading(true);

    try {
      // Resize the image before uploading
      const resizedFile = await resizeImage(
        file, 
        resizeOptions.size, 
        resizeOptions.quality
      );
      
      // Check if the resized file is still too large
      const MAX_UPLOAD_SIZE = 500 * 1024; // 500KB
      if (resizedFile.size > MAX_UPLOAD_SIZE) {
        // Try again with lower quality
        const lowerQualityFile = await resizeImage(
          file,
          resizeOptions.size,
          0.6 // Lower quality to reduce file size further
        );
        
        if (lowerQualityFile.size > MAX_UPLOAD_SIZE) {
          // If still too large, try with even lower quality
          const lowestQualityFile = await resizeImage(
            file,
            resizeOptions.size,
            0.4 // Even lower quality
          );
          
          if (lowestQualityFile.size > MAX_UPLOAD_SIZE) {
            alert(`Image is still too large after resizing. Please try a different image.`);
            setIsUploading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            return;
          }
          
          // Use the lowest quality version
          var fileToUpload = lowestQualityFile;
        } else {
          // Use the lower quality version
          var fileToUpload = lowerQualityFile;
        }
      } else {
        // Use the original resized version
        var fileToUpload = resizedFile;
      }
      
      // Create a unique filename with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${file.name.split('.')[0]}-${timestamp}.${fileExtension}`;
      
      const response = await fetch(
        `/api/upload-image?filename=${encodeURIComponent(uniqueFilename)}`,
        {
          method: 'POST',
          body: fileToUpload,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = `Failed to upload image: ${response.status} ${response.statusText}`;
        
        // Try to parse the error response
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
            
            // Check for specific error conditions
            if (errorMessage.includes('Vercel Blob is not properly configured')) {
              errorMessage = 'The image upload service is not properly configured. Please contact the administrator.';
            }
            
            if (errorJson.details) {
              console.error('Error details:', errorJson.details);
            }
          }
        } catch (e) {
          // If we can't parse the JSON, just use the status text
        }
        
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      const blob = await response.json() as PutBlobResult;
      
      // Update the image URL in the page details
      setPageDetails((prev) =>
        prev
          ? {
              ...prev,
              image: blob.url,
            }
          : null
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Only show generic alert if we haven't already shown a specific one
      if (error instanceof Error && !error.message.startsWith('Failed to upload image:')) {
        alert('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Solana Token
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
                          title: metadata.name,
                          description: metadata.description || "",
                          image: metadata.image || "",
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

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <div className="flex gap-2">
            <Input
              ref={imageInputRef}
              type="text"
              value={pageDetails?.image || ""}
              onChange={(e) =>
                setPageDetails((prev) =>
                  prev
                    ? {
                        ...prev,
                        image: e.target.value,
                      }
                    : null
                )
              }
              placeholder="Enter image URL"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              type="button">
              {isUploading ? (
                <span className="flex items-center gap-1">
                  <Loader className="h-4 w-4 text-current" /> Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Upload className="h-4 w-4" /> Upload
                </span>
              )}
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Images will be cropped to a {resizeOptions.size}x{resizeOptions.size}px square
          </p>
        </div>
        {pageDetails?.image && (
          <div className="relative w-16 h-16">
            <img
              src={pageDetails.image || ''}
              alt={pageDetails.title || 'Image preview'}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
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
    </div>
  );
}
