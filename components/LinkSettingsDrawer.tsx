import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageData, PageItem } from "@/types";
import { validateLinkUrl } from "@/lib/links";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { HelpCircle, AlertCircle, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Drawer } from "@/components/ui/drawer";
import { useEffect, useRef } from "react";

interface LinkSettingsDrawerProps {
  item?: PageItem;
  error?: string;
  tokenSymbol?: string;
  pageDetails?: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  onDelete?: () => void;
  onUrlChange?: (url: string) => void;
  onValidationChange?: (itemId: string, error: string | undefined) => void;
  onBack?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LinkSettingsDrawer({
  item,
  error,
  tokenSymbol,
  pageDetails,
  setPageDetails,
  onDelete,
  onUrlChange,
  onValidationChange,
  onBack,
  open,
  onOpenChange,
}: LinkSettingsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  useEffect(() => {
    // Only focus the title input on desktop devices
    if (titleInputRef.current && !isMobileDevice()) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !error) {
      e.preventDefault();
      closeButtonRef.current?.click();
    }
  };

  // Validate URL whenever it changes
  useEffect(() => {
    // Only run validation when drawer is open
    if (!open) return;
    
    if (!item || !onValidationChange) return;

    const preset = LINK_PRESETS[item.presetId];
    if (!preset?.options?.requiresUrl) return;

    if (!item.url) {
      onValidationChange(item.id, `${preset.title} URL is required`);
    } else if (!validateLinkUrl(item.url, item.presetId)) {
      onValidationChange(item.id, `Invalid ${preset.title} URL format`);
    } else {
      onValidationChange(item.id, undefined);
    }

    return () => {
      // Clear validation when drawer closes or unmounts
      onValidationChange?.(item.id, undefined);
    };
  }, [item?.url, item?.id, item?.presetId, onValidationChange, open]);

  if (!item) return null;

  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const Icon = preset.icon;

  const handleTitleChange = (value: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                title: value,
              }
            : i
        ),
      };
    });
  };

  const handleUrlChange = (value: string) => {
    if (!onUrlChange) return;
    onUrlChange(value);
  };

  const handleTokenGateChange = (checked: boolean) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items?.map((i) =>
        i.id === item.id
          ? {
              ...i,
              tokenGated: checked,
              requiredTokens: checked ? ["1"] : [],
            }
          : i
      );
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleRequiredTokensChange = (value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    setPageDetails((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items?.map((i) =>
        i.id === item.id
          ? {
              ...i,
              requiredTokens: value ? [value] : [],
            }
          : i
      );
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      title={`${preset.title} Settings`}
      icon={<Icon className="h-5 w-5" />}
      backButton={!!onBack}
      hasContainer
      onBack={onBack}
      closeButton>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Title</label>
            <Input
              type="text"
              ref={titleInputRef}
              placeholder={preset.title}
              value={item.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {preset.options?.requiresUrl && (
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder={
                      item.presetId === "email"
                        ? "Enter email address"
                        : `Enter ${preset.title} URL`
                    }
                    value={item.url || ""}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`${
                      error ? "border-red-500 focus:ring-red-500" : ""
                    } ${item.tokenGated ? "pr-8" : ""}`}
                  />
                  {item.tokenGated && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Lock className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This URL is encrypted.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                {item.url && (
                  <Button
                    variant="outline"
                    onClick={() => item.url && window.open(item.url, "_blank")}
                    className="whitespace-nowrap">
                    Test Link
                  </Button>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {preset.options?.canBeTokenGated && (
          <div className="space-y-3">
            {!pageDetails?.connectedToken ? (
              <></>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={item.tokenGated}
                      onCheckedChange={handleTokenGateChange}
                    />
                    <span className="text-sm text-gray-600">Token gate</span>
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          This requires your visitor to own{" "}
                          {tokenSymbol || "tokens"} to get access to this link.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {item.tokenGated && (
                  <div className="pl-6 border-l-2 border-violet-200">
                    <label className="block text-sm text-gray-600 mb-1">
                      Required tokens
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.requiredTokens?.[0] || "1"}
                        onChange={(e) =>
                          handleRequiredTokensChange(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        className="w-24"
                      />
                      {tokenSymbol && (
                        <span className="text-sm text-gray-500">
                          ${tokenSymbol}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-100">
                Delete Link
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this link from your page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {error ? (
            <Button
              onClick={() => {}}
              variant="outline"
              className="text-red-500 hover:bg-red-50">
              Fix Error to Continue
            </Button>
          ) : (
            <Button ref={closeButtonRef} onClick={() => onOpenChange?.(false)}>
              Done
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
