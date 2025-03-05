import { Drawer } from "@/components/ui/drawer";
import { FontSelect } from "@/components/FontSelector";
import { PageData } from "@/types";
import { Type } from "lucide-react";

interface FontsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}

export function FontsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: FontsDrawerProps) {
  const updateFont = (type: 'global' | 'heading' | 'paragraph' | 'links', value: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        themeFonts: {
          global: type === 'global' ? (value === "system" ? null : value) : (prev.themeFonts?.global ?? null),
          heading: type === 'heading' ? (value === "inherit" ? null : value) : (prev.themeFonts?.heading ?? null),
          paragraph: type === 'paragraph' ? (value === "inherit" ? null : value) : (prev.themeFonts?.paragraph ?? null),
          links: type === 'links' ? (value === "inherit" ? null : value) : (prev.themeFonts?.links ?? null)
        }
      };
    });
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      title="Typography"
      icon={<Type className="h-5 w-5" />}
      closeButton>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Global Font
            </label>
            <FontSelect
              value={pageDetails?.themeFonts?.global || "system"}
              onValueChange={(value: string) => updateFont('global', value)}
              defaultValue="system"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Heading Font
            </label>
            <FontSelect
              value={pageDetails?.themeFonts?.heading || "inherit"}
              onValueChange={(value: string) => updateFont('heading', value)}
              defaultValue="inherit"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Paragraph Font
            </label>
            <FontSelect
              value={pageDetails?.themeFonts?.paragraph || "inherit"}
              onValueChange={(value: string) => updateFont('paragraph', value)}
              defaultValue="inherit"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Links Font</label>
            <FontSelect
              value={pageDetails?.themeFonts?.links || "inherit"}
              onValueChange={(value: string) => updateFont('links', value)}
              defaultValue="inherit"
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}