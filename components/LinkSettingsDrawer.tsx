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
import { HelpCircle, AlertCircle, ArrowLeft } from "lucide-react";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useRef } from "react";

interface LinkSettingsDrawerProps {
  item?: PageItem;
  error?: string;
  tokenSymbol?: string;
  pageDetails?: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  onDelete?: () => void;
  onUrlChange?: (url: string) => void;
  onValidationChange?: (itemId: string, error: string | undefined) => void;
  onBack?: () => void;
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
}: LinkSettingsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Debug logging for all props and state
  useEffect(() => {
    console.log('LinkSettingsDrawer props and state:', {
      item,
      tokenSymbol,
      pageDetails: {
        connectedToken: pageDetails?.connectedToken,
        tokenSymbol: pageDetails?.tokenSymbol,
        fullDetails: pageDetails
      },
    });
  }, [item, tokenSymbol, pageDetails]);

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
    if (e.key === 'Enter' && !error) {
      e.preventDefault();
      closeButtonRef.current?.click();
    }
  };

  // Validate URL whenever it changes
  useEffect(() => {
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
  }, [item, onValidationChange]);

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

  // Debug logging for token gating conditions
  console.log('Token gating conditions:', {
    presetCanBeTokenGated: preset.options?.canBeTokenGated,
    connectedToken: pageDetails?.connectedToken,
    shouldShowTokenGating: preset.options?.canBeTokenGated && Boolean(pageDetails?.connectedToken)
  });

  return (
    <div className="max-w-lg mx-auto w-full">
      <DrawerHeader>
        <DrawerTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span>{preset.title} Settings</span>
        </DrawerTitle>
      </DrawerHeader>
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
                <Input
                  type="text"
                  placeholder={item.presetId === 'email' ? "Enter email address" : `Enter ${preset.title} URL`}
                  value={item.url || ''}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${error ? "border-red-500 focus:ring-red-500" : ""} flex-1`}
                />
                {item.url && (
                  <Button
                    variant="outline"
                    onClick={() => item.url && window.open(item.url, '_blank')}
                    className="whitespace-nowrap"
                  >
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
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                Connect a token in the page settings to enable token gating.
                <pre className="mt-2 text-xs bg-white p-2 rounded">
                  Debug: {JSON.stringify({ connectedToken: pageDetails?.connectedToken, tokenSymbol: pageDetails?.tokenSymbol }, null, 2)}
                </pre>
              </div>
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
                        <p>This requires your visitor to own {tokenSymbol || "tokens"} to get access to this link.</p>
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
                        onChange={(e) => handleRequiredTokensChange(e.target.value)}
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
            <Button onClick={() => {}} variant="outline" className="text-red-500 hover:bg-red-50">
              Fix Error to Continue
            </Button>
          ) : (
            <DrawerClose asChild>
              <Button ref={closeButtonRef}>Done</Button>
            </DrawerClose>
          )}
        </div>
      </div>
    </div>
  );
} 