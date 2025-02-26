import { useState, useRef, forwardRef, ForwardedRef } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { PutBlobResult } from '@vercel/blob';
import Loader from "@/components/ui/loader";

interface ImageUploaderProps {
  imageUrl: string | null | undefined;
  onImageChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  previewSize?: number;
  buttonText?: string;
  label?: string;
  helpText?: string;
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

export const ImageUploader = forwardRef(({
  imageUrl,
  onImageChange,
  placeholder = "Enter image URL",
  className = "",
  showPreview = true,
  previewSize = 64,
  buttonText = "Upload",
  label,
  helpText = "Images will be cropped to a 200x200px square"
}: ImageUploaderProps, ref: ForwardedRef<HTMLInputElement>) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const internalImageInputRef = useRef<HTMLInputElement>(null);
  const [resizeOptions] = useState({
    size: 200,
    quality: 0.8,
  });

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
      
      // Update the image URL
      onImageChange(blob.url);
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
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-4">
        {/* Image/Upload Button Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer group"
          style={{ minWidth: `${previewSize}px`, height: `${previewSize}px` }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="Preview"
                className="object-cover w-full h-full rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
              <Loader className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              ref={ref}
              type="text"
              value={imageUrl || ""}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {helpText && (
            <p className="mt-1 text-xs text-gray-500">
              {helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

// Add display name
ImageUploader.displayName = "ImageUploader"; 