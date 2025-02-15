import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageData } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLinkPreset } from "@/lib/linkPresets";

interface SortableItemProps {
  id: string;
  item: {
    id: string;
    type: string;
    title?: string;
    url?: string;
    tokenGated?: boolean;
    requiredTokens?: string[];
    order?: number;
  };
  error?: string;
  onUrlChange: (url: string) => void;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  tokenSymbol?: string;
  isOpen?: boolean;
  onOpen?: () => void;
  onDelete?: () => void;
}

export function SortableItem({
  id,
  item,
  error,
  onUrlChange,
  setPageDetails,
  tokenSymbol,
  isOpen,
  onOpen,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Return null if item is not available
  if (!item) return null;

  const preset = getLinkPreset(item.id);
  if (!preset) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

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

  const handleTokenGateChange = (checked: boolean) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                tokenGated: checked,
                requiredTokens: checked ? ["1"] : undefined, // Default to 1 token when enabled
              }
            : i
        ),
      };
    });
  };

  const handleRequiredTokensChange = (value: string) => {
    // Only allow positive numbers
    if (value && !/^\d+$/.test(value)) return;

    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                requiredTokens: value ? [value] : undefined,
              }
            : i
        ),
      };
    });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Accordion
        type="single"
        collapsible
        value={isOpen ? id : undefined}
        onValueChange={(value) => {
          if (onOpen) {
            onOpen();
          }
        }}>
        <AccordionItem value={id} className="border rounded-lg mb-2">
          <div className="flex items-center px-4">
            <Button
              variant="ghost"
              {...attributes}
              {...listeners}
              className="cursor-grab h-full p-2 hover:bg-transparent">
              <GripVertical className="h-4 w-4" />
            </Button>
            <AccordionTrigger className="hover:no-underline py-3 flex-1">
              <div className="flex items-center gap-4">
                <preset.icon className="h-4 w-4" />
                <span>{item.title || preset.title}</span>
                {error && (
                  <span className="text-sm text-red-500 ml-2">{error}</span>
                )}
                {item.tokenGated && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 text-gray-400">
                    <path
                      fillRule="evenodd"
                      d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </AccordionTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-full p-2 hover:bg-transparent">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  type="text"
                  placeholder={`Enter ${preset.title.toLowerCase()} title`}
                  value={item.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  type="text"
                  placeholder={preset.placeholder || "Enter URL"}
                  value={item.url || ""}
                  onChange={(e) => onUrlChange(e.target.value)}
                />
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-3 space-y-3">
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
                        onChange={(e) =>
                          handleRequiredTokensChange(e.target.value)
                        }
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
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
