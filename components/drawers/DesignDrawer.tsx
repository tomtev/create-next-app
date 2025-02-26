import { Drawer } from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontSelect } from "@/components/FontSelector";
import { PageData } from "@/types";
import { themes } from "@/lib/themes";
import { Palette } from "lucide-react";

interface DesignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}

export function DesignDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: DesignDrawerProps) {
  const handleThemeChange = (value: string) => {
    const themePreset = themes[value];
    if (!themePreset) return;

    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        theme: value,
        themeFonts: {
          global: themePreset.fonts.global || null,
          heading: themePreset.fonts.heading || null,
          paragraph: themePreset.fonts.paragraph || null,
          links: themePreset.fonts.links || null
        }
      };
    });
  };

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
      title="Design"
      icon={<Palette className="h-5 w-5" />}
      closeButton>
      <div className="space-y-6">
        <div>
          <label className="block text-base font-bold text-gray-700 mb-1">
            Style
          </label>
          <Select
            value={pageDetails?.theme || "default"}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(themes).map(([key, theme]) => (
                <SelectItem key={key} value={key}>
                  {theme.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-base font-bold text-gray-700">Typography</h3>

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