import { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { PageData } from "@/types";
import { Code, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { themes } from "@/lib/themes";

interface CssVariablesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}

interface CssVariable {
  name: string;
  value: string;
  description: string;
}

export function CssVariablesDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: CssVariablesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cssVariables, setCssVariables] = useState<CssVariable[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  // Get all CSS variables from current theme
  useEffect(() => {
    if (!pageDetails) return;
    
    const currentTheme = pageDetails.theme || "default";
    const themeStyles = themes[currentTheme]?.styles || {};
    
    // Create descriptions for common variables
    const descriptions: Record<string, string> = {
      "--pf-page-bg": "Page background color",
      "--pf-page-text-color": "Main text color",
      "--pf-page-muted-color": "Secondary text color",
      "--pf-title-color": "Title text color",
      "--pf-description-color": "Description text color",
      "--pf-link-background": "Link background color",
      "--pf-link-background-hover": "Link background color on hover",
      "--pf-link-border-color": "Link border color",
      "--pf-link-border-width": "Link border width",
      "--pf-link-border-style": "Link border style (solid, dashed, etc.)",
      "--pf-link-border-radius": "Link corner radius",
      "--pf-link-color": "Link text color",
      "--pf-link-color-hover": "Link text color on hover",
      "--pf-gradient-blur": "Gradient blur amount",
      "--pf-gradient-border-width": "Width of gradient border effect",
      "--pf-gradient-border": "Gradient border definition",
      "--pf-title-gradient": "Title gradient color effect",
      "--pf-description-gradient": "Description gradient color effect",
      "--pf-pixel-border-color": "Color for pixel border effect",
      "--pf-pixel-border-width": "Width for pixel border effect",
    };

    // Create variables array
    const variables = Object.entries(themeStyles).map(([name, value]) => ({
      name,
      value: value as string,
      description: descriptions[name] || "Custom theme variable"
    }));

    // Add any pageDetails custom variables if they exist
    if (pageDetails.customCssVariables) {
      setCustomValues(pageDetails.customCssVariables);
    } else {
      setCustomValues({});
    }

    setCssVariables(variables);
  }, [pageDetails]);

  // Filter variables based on search
  const filteredVariables = cssVariables.filter(variable => 
    variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    variable.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle value change
  const handleValueChange = (name: string, value: string) => {
    const newCustomValues = {
      ...customValues,
      [name]: value
    };
    
    // If value is empty or matches the theme default, remove it
    if (!value || value === "") {
      delete newCustomValues[name];
    }
    
    setCustomValues(newCustomValues);
    
    // Update page details
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        customCssVariables: Object.keys(newCustomValues).length > 0 ? newCustomValues : undefined
      };
    });
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      title="CSS Variables"
      icon={<Code className="h-5 w-5" />}
      closeButton>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variables..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-[500px]">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Variable</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                  <th className="px-4 py-2 text-left font-medium w-1/3">Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariables.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">
                      No variables found
                    </td>
                  </tr>
                ) : (
                  filteredVariables.map((variable) => (
                    <tr key={variable.name} className="border-b">
                      <td className="px-4 py-2 align-middle font-mono text-xs">
                        {variable.name}
                      </td>
                      <td className="px-4 py-2 align-middle text-muted-foreground">
                        {variable.description}
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={customValues[variable.name] || ""}
                          onChange={(e) => handleValueChange(variable.name, e.target.value)}
                          placeholder={variable.value}
                          className="h-8 text-xs"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        
        <div className="text-xs text-muted-foreground mt-2">
          <p>Enter custom values to override theme defaults. Leave blank to use theme value.</p>
          <p className="mt-1">For colors, use HEX (#fff), RGB (rgb(255,255,255)), or named colors.</p>
        </div>
      </div>
    </Drawer>
  );
}