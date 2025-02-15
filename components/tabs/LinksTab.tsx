import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
import { PageData, PageItem } from "@/types";
import React, { useState, useEffect } from "react";
import { getLinkPreset } from "@/lib/linkPresets";
import LinkPresetToggle from "@/components/LinkPresetToggle";
import { LinkType } from "@/lib/links";

interface LinksTabProps {
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  isAuthenticated?: boolean;
  canEdit?: boolean;
  onConnect?: () => void;
  openLinkId?: string;
  onLinkOpen?: (id: string | null) => void;
  onValidationErrorsChange?: (errors: { [key: string]: string }) => void;
}

// Helper function to get a consistent item ID
function getItemId(item: { id: string }): string {
  return item.id;
}

export function LinksTab({
  pageDetails,
  setPageDetails,
  isAuthenticated,
  canEdit,
  onConnect,
  openLinkId,
  onLinkOpen,
  onValidationErrorsChange,
}: LinksTabProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validate URLs when items change
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    pageDetails?.items?.forEach((item) => {
      const preset = getLinkPreset(item.id);
      if (preset?.urlPattern) {
        if (!item.url) {
          newErrors[item.id] = `${preset.title} URL is required`;
        } else if (!preset.urlPattern.test(item.url)) {
          newErrors[item.id] = `Invalid ${preset.title} URL format`;
        }
      }
    });
    setErrors(newErrors);
    onValidationErrorsChange?.(newErrors);
  }, [pageDetails?.items, onValidationErrorsChange]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && pageDetails?.items) {
      const oldIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === active.id,
      );
      const newIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === over?.id,
      );

      setPageDetails((prevDetails) => {
        if (!prevDetails?.items) return prevDetails;

        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex);

        return {
          ...prevDetails,
          items: newItems,
        };
      });
    }
  };

  const handleAddLinks = () => {
    setPageDetails((prev) => {
      if (!prev) return prev;

      const currentItems = prev.items || [];
      const newItems = selectedPresets
        .map((presetId, index) => {
          const preset = getLinkPreset(presetId);
          if (!preset) return null;

          return {
            id: presetId,
            type: presetId as LinkType,
            title: preset.title,
            url: preset.dummyUrl,
            order: currentItems.length + index,
            tokenGated: false,
          } as PageItem;
        })
        .filter((item): item is PageItem => item !== null);

      return {
        ...prev,
        items: [...currentItems, ...newItems],
      };
    });

    setIsAddLinkOpen(false);
    setSelectedPresets([]);
  };

  const handleUrlChange = (itemId: string, url: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;

      // Validate URL before updating
      const preset = getLinkPreset(itemId);
      if (!preset?.urlPattern) return prev;

      // Format URL based on link type
      let formattedUrl = url.trim();

      if (preset.group === 'token' && preset.urlTemplate && prev.connectedToken) {
        // For token links, use the template with the connected token
        formattedUrl = preset.urlTemplate.replace('{token}', prev.connectedToken);
      } else if (preset.id === 'email') {
        // For email type, add mailto: if it's not already a URL
        if (formattedUrl && !formattedUrl.startsWith('mailto:') && !formattedUrl.match(/^https?:\/\//)) {
          // Remove any existing mailto: prefix to avoid duplication
          const cleanValue = formattedUrl.replace(/^mailto:/, '');
          formattedUrl = `mailto:${cleanValue}`;
        }
      } else {
        // For non-email links, add https:// if missing
        if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
          formattedUrl = `https://${formattedUrl}`;
        }
      }

      // Update validation errors
      const newErrors = { ...errors };
      if (!formattedUrl) {
        newErrors[itemId] = `${preset.title} URL is required`;
      } else if (!preset.urlPattern.test(formattedUrl)) {
        newErrors[itemId] = `Invalid ${preset.title} URL format`;
      } else {
        delete newErrors[itemId];
      }
      setErrors(newErrors);
      onValidationErrorsChange?.(newErrors);

      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === itemId ? { ...i, url: formattedUrl } : i
        ),
      };
    });
  };

  const handleAccordionToggle = (itemId: string) => {
    if (openLinkId === itemId) {
      onLinkOpen?.(null);
    } else {
      onLinkOpen?.(itemId);
    }
  };

  // Get available presets (excluding already added ones)
  const getAvailablePresets = () => {
    const addedPresetIds = new Set(pageDetails?.items?.map(item => item.id) || []);
    return selectedPresets.filter(id => !addedPresetIds.has(id));
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex justify-between items-center">
        <Dialog open={isAddLinkOpen} onOpenChange={setIsAddLinkOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <LinkPresetToggle
                selectedPresets={selectedPresets}
                onTogglePreset={(presetId, checked) => {
                  setSelectedPresets(prev =>
                    checked
                      ? [...prev, presetId]
                      : prev.filter(id => id !== presetId)
                  );
                }}
              />
              
              <div className="flex justify-end">
                <Button
                  onClick={handleAddLinks}
                  disabled={getAvailablePresets().length === 0}>
                  Add Selected Links
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pageDetails?.items?.map((i) => getItemId(i)) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {!pageDetails?.connectedToken && pageDetails?.items?.some(item => item.tokenGated) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Connect a token in the Settings tab to enable token gating for your links.
                </p>
              </div>
            )}
            {pageDetails?.items?.map((item) => {
              const preset = getLinkPreset(item.id);
              if (!preset) return null;

              return (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  error={errors[item.id]}
                  onUrlChange={(url) => handleUrlChange(item.id, url)}
                  setPageDetails={setPageDetails}
                  tokenSymbol={pageDetails?.tokenSymbol}
                  isOpen={openLinkId === item.id}
                  onOpen={() => handleAccordionToggle(item.id)}
                  onDelete={() => {
                    if (errors[item.id]) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[item.id];
                        return newErrors;
                      });
                    }

                    setPageDetails((prev) => ({
                      ...prev!,
                      items: prev!.items!.filter((i) => i.id !== item.id),
                    }));
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
