import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageData } from "@/types";
import { themes } from "@/lib/themes";
import { Palette, Type, Code } from "lucide-react";
import { FontsDrawer } from "./FontsDrawer";
import { CssVariablesDrawer } from "./CssVariablesDrawer";

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
  const [fontsDrawerOpen, setFontsDrawerOpen] = useState(false);
  const [cssVarsDrawerOpen, setCssVarsDrawerOpen] = useState(false);

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

  // Helper function to get preview colors for theme tiles
  const getThemePreviewColors = (themeKey: string) => {
    const themeData = themes[themeKey];
    
    let bgColor = themeData.styles["--pf-page-bg"] || "#ffffff";
    let textColor = themeData.styles["--pf-page-text-color"] || "#000000";
    let accentColor = themeData.styles["--pf-title-color"] || "#000000";
    let hasGradientBg = false;
    let gradientDef = "";
    
    // Handle linear-gradient and other complex values for the preview
    if (bgColor.startsWith("linear-gradient") || bgColor.startsWith("radial-gradient")) {
      gradientDef = bgColor;
      hasGradientBg = true;
      // Keep bgColor as fallback for browsers that don't support SVG gradients
      bgColor = "#8e9aaf";
    }
    
    // Handle title gradient if available
    let hasTitleGradient = false;
    let titleGradientDef = "";
    if (themeData.effects?.titleGradientBackground && themeData.styles["--pf-title-gradient"]) {
      hasTitleGradient = true;
      titleGradientDef = themeData.styles["--pf-title-gradient"];
    }
    
    if (bgColor.startsWith("var(")) {
      bgColor = "#ffffff"; // Fallback for CSS variables
    }
    
    if (textColor.startsWith("var(")) {
      textColor = "#000000"; // Fallback
    }
    
    if (accentColor.startsWith("var(")) {
      accentColor = "#505050"; // Fallback
    }
    
    // Check for special effects
    const hasLuminanceEffect = !!themeData.effects?.luminance;
    const hasLinkGradient = !!themeData.effects?.linkGradientBorder;
    
    return { 
      bgColor, 
      textColor, 
      accentColor, 
      hasGradientBg, 
      gradientDef,
      hasTitleGradient,
      titleGradientDef,
      hasLuminanceEffect,
      hasLinkGradient
    };
  };

  const currentTheme = pageDetails?.theme || "default";

  return (
    <>
      <Drawer 
        open={open} 
        onOpenChange={onOpenChange}
        title="Design"
        icon={<Palette className="h-5 w-5" />}
        closeButton>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-gray-700">
                Theme
              </label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFontsDrawerOpen(true)}
                  className="text-xs px-2 py-1 h-8"
                >
                  <Type className="h-4 w-4 mr-1" />
                  Typography
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCssVarsDrawerOpen(true)}
                  className="text-xs px-2 py-1 h-8"
                >
                  <Code className="h-4 w-4 mr-1" />
                  CSS Variables
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <div 
                className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar" 
                style={{ 
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {Object.entries(themes).map(([key, theme]) => {
                  const { 
                    bgColor, 
                    textColor, 
                    accentColor, 
                    hasGradientBg, 
                    gradientDef,
                    hasTitleGradient,
                    titleGradientDef,
                    hasLuminanceEffect,
                    hasLinkGradient
                  } = getThemePreviewColors(key);
                  const isSelected = currentTheme === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`flex-shrink-0 flex flex-col border rounded-lg overflow-hidden transition-all ${
                        isSelected 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : 'hover:border-gray-400'
                      }`}
                      style={{ width: '100px' }}
                    >
                      <div 
                        className="h-16 w-full p-1"
                        style={{ 
                          backgroundColor: bgColor
                        }}
                      >
                        {/* SVG Theme Preview */}
                        <svg width="100%" height="100%" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                          {/* Defs for gradients and effects */}
                          <defs>
                            {/* Background gradient if needed */}
                            {hasGradientBg && (
                              <linearGradient id={`bg-gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#667eea" />
                                <stop offset="100%" stopColor="#764ba2" />
                              </linearGradient>
                            )}
                            
                            {/* Title gradient if needed */}
                            {hasTitleGradient && (
                              <linearGradient id={`title-gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#9945FF" />
                                <stop offset="50%" stopColor="#43B4CA" />
                                <stop offset="100%" stopColor="#19FB9B" />
                              </linearGradient>
                            )}
                            
                            {/* Link gradient if needed */}
                            {hasLinkGradient && (
                              <radialGradient id={`link-gradient-${key}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                              </radialGradient>
                            )}
                          </defs>
                          
                          {/* Background overlay for gradient effect */}
                          {hasGradientBg && (
                            <rect 
                              x="0" 
                              y="0" 
                              width="100%" 
                              height="100%" 
                              fill={`url(#bg-gradient-${key})`} 
                            />
                          )}
                          
                          {/* Content Group - Centered */}
                          <g transform="translate(50, 15)">
                            {/* Profile/Avatar Circle - Centered */}
                            <circle 
                              cx="0" 
                              cy="0" 
                              r="8" 
                              fill="rgba(255,255,255,0.1)" 
                              stroke={accentColor}
                              strokeWidth="1"
                            />
                            
                            {/* Title - Centered */}
                            <rect 
                              x="-18" 
                              y="12" 
                              width="36" 
                              height="4" 
                              rx="1" 
                              fill={hasTitleGradient ? `url(#title-gradient-${key})` : accentColor} 
                            />
                            
                            {/* Description - Centered */}
                            <rect 
                              x="-12" 
                              y="18" 
                              width="24" 
                              height="2" 
                              rx="1" 
                              fill={textColor}
                              opacity="0.7"
                            />
                          </g>
                          
                          {/* Single Link/Button - Centered */}
                          <g transform="translate(50, 44)">
                            {/* Get link background and border */}
                            {(() => {
                              const linkBg = themes[key].styles["--pf-link-background"] || "rgba(255,255,255,0.1)";
                              const linkBorderWidth = themes[key].styles["--pf-link-border-width"] || "0px";
                              const linkBorderColor = themes[key].styles["--pf-link-border-color"] || "transparent";
                              const linkBorderRadius = parseFloat(themes[key].styles["--pf-link-border-radius"] || "4") || 4;
                              
                              // Use pixel border if effect is enabled
                              const usePixelBorder = themes[key].effects?.linkPixelBorder;
                              const pixelBorderColor = themes[key].styles["--pf-pixel-border-color"];
                              
                              // Button dimensions
                              const buttonWidth = 40;
                              
                              return (
                                <>
                                  {/* Link background */}
                                  <rect 
                                    x={-buttonWidth/2} 
                                    y="-4" 
                                    width={buttonWidth} 
                                    height="8" 
                                    rx={linkBorderRadius} 
                                    fill={linkBg}
                                    stroke={linkBorderWidth !== "0px" ? linkBorderColor : "none"} 
                                    strokeWidth={linkBorderWidth !== "0px" ? "1" : "0"}
                                  />
                                  
                                  {/* Gradient border effect */}
                                  {hasLinkGradient && (
                                    <rect 
                                      x={-(buttonWidth/2) - 1} 
                                      y="-5" 
                                      width={buttonWidth + 2} 
                                      height="10" 
                                      rx={linkBorderRadius + 1}
                                      fill="none"
                                      stroke={`url(#link-gradient-${key})`}
                                      strokeWidth="1"
                                      opacity="0.8"
                                    />
                                  )}
                                  
                                  {/* Pixel border effect */}
                                  {usePixelBorder && (
                                    <rect 
                                      x={-(buttonWidth/2) - 1} 
                                      y="-5" 
                                      width={buttonWidth + 2} 
                                      height="10" 
                                      stroke={pixelBorderColor || "#000"} 
                                      strokeWidth="0.5" 
                                      fill="none"
                                      strokeDasharray="1,1"
                                    />
                                  )}
                                  
                                  {/* Link text */}
                                  <rect 
                                    x="-10" 
                                    y="-1" 
                                    width="20" 
                                    height="2" 
                                    rx="1" 
                                    fill={textColor} 
                                  />
                                </>
                              );
                            })()}
                          </g>
                        </svg>
                      </div>
                      <div className="bg-white px-2 py-1 text-[10px] font-medium text-center truncate">
                        {theme.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <style jsx global>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              
              /* Hide scrollbar for IE, Edge and Firefox */
              .hide-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            `}</style>

            {/* Selected Theme Preview - Larger */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="h-28 w-full p-2"
                style={{ 
                  backgroundColor: getThemePreviewColors(currentTheme).bgColor
                }}
              >
                {/* Current theme preview - larger version */}
                <svg width="100%" height="100%" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                  {/* Defs for gradients and effects */}
                  <defs>
                    {/* Background gradient if needed */}
                    {getThemePreviewColors(currentTheme).hasGradientBg && (
                      <linearGradient id="current-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    )}
                    
                    {/* Title gradient if needed */}
                    {getThemePreviewColors(currentTheme).hasTitleGradient && (
                      <linearGradient id="current-title-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="50%" stopColor="#43B4CA" />
                        <stop offset="100%" stopColor="#19FB9B" />
                      </linearGradient>
                    )}
                    
                    {/* Link gradient if needed */}
                    {getThemePreviewColors(currentTheme).hasLinkGradient && (
                      <radialGradient id="current-link-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </radialGradient>
                    )}
                    
                    {/* Luminance filter */}
                    {getThemePreviewColors(currentTheme).hasLuminanceEffect && (
                      <filter id="current-luminance" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                        <feColorMatrix type="matrix" values="
                          1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 15 -6
                        "/>
                      </filter>
                    )}
                  </defs>
                  
                  {/* Background overlay for gradient effect */}
                  {getThemePreviewColors(currentTheme).hasGradientBg && (
                    <rect 
                      x="0" 
                      y="0" 
                      width="100%" 
                      height="100%" 
                      fill="url(#current-bg-gradient)" 
                    />
                  )}
                  
                  {/* Content Group - Centered */}
                  <g transform="translate(100, 25)">
                    {/* Profile/Avatar Circle - Centered */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="16" 
                      fill="rgba(255,255,255,0.1)" 
                      stroke={getThemePreviewColors(currentTheme).accentColor}
                      strokeWidth="1.5"
                    />
                    
                    {/* Title - Centered */}
                    <rect 
                      x="-40" 
                      y="24" 
                      width="80" 
                      height="8" 
                      rx="2" 
                      fill={getThemePreviewColors(currentTheme).hasTitleGradient ? "url(#current-title-gradient)" : getThemePreviewColors(currentTheme).accentColor} 
                    />
                    
                    {/* Description - Centered */}
                    <rect 
                      x="-30" 
                      y="36" 
                      width="60" 
                      height="4" 
                      rx="1" 
                      fill={getThemePreviewColors(currentTheme).textColor}
                      opacity="0.7"
                    />
                  </g>
                  
                  {/* Links/Buttons - Centered horizontally, positioned at bottom */}
                  {[0, 1].map((i) => {
                    // Get link background and border
                    const linkBg = themes[currentTheme].styles["--pf-link-background"] || "rgba(255,255,255,0.1)";
                    const linkBorderWidth = themes[currentTheme].styles["--pf-link-border-width"] || "0px";
                    const linkBorderColor = themes[currentTheme].styles["--pf-link-border-color"] || "transparent";
                    const linkBorderRadius = parseFloat(themes[currentTheme].styles["--pf-link-border-radius"] || "4") || 4;
                    
                    // Use pixel border if effect is enabled
                    const usePixelBorder = themes[currentTheme].effects?.linkPixelBorder;
                    const pixelBorderColor = themes[currentTheme].styles["--pf-pixel-border-color"];
                    
                    // Calculate button width and position for centering
                    const buttonWidth = 80;
                    const xPos = 100 - (buttonWidth / 2);
                    
                    return (
                      <g key={i} transform={`translate(${xPos}, ${65 + i * 16})`}>
                        {/* Link background */}
                        <rect 
                          x="0" 
                          y="0" 
                          width={buttonWidth} 
                          height="10" 
                          rx={linkBorderRadius} 
                          fill={linkBg}
                          stroke={linkBorderWidth !== "0px" ? linkBorderColor : "none"} 
                          strokeWidth={linkBorderWidth !== "0px" ? "1" : "0"}
                        />
                        
                        {/* Gradient border effect */}
                        {getThemePreviewColors(currentTheme).hasLinkGradient && (
                          <rect 
                            x="-1" 
                            y="-1" 
                            width={buttonWidth + 2} 
                            height="12" 
                            rx={linkBorderRadius + 1}
                            fill="none"
                            stroke="url(#current-link-gradient)"
                            strokeWidth="1.5"
                            opacity="0.8"
                          />
                        )}
                        
                        {/* Pixel border effect */}
                        {usePixelBorder && (
                          <rect 
                            x="-1.5" 
                            y="-1.5" 
                            width={buttonWidth + 3} 
                            height="13" 
                            stroke={pixelBorderColor || "#000"} 
                            strokeWidth="1" 
                            fill="none"
                            strokeDasharray="2,2"
                          />
                        )}
                        
                        {/* Luminance effect */}
                        {getThemePreviewColors(currentTheme).hasLuminanceEffect && (
                          <circle 
                            cx={buttonWidth / 2} 
                            cy="5" 
                            r="15" 
                            fill="rgba(255,255,255,0.1)" 
                            filter="url(#current-luminance)"
                          />
                        )}
                        
                        {/* Link text */}
                        <rect 
                          x={(buttonWidth / 2) - 15} 
                          y="3" 
                          width="30" 
                          height="4" 
                          rx="1" 
                          fill={getThemePreviewColors(currentTheme).textColor} 
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="bg-white px-3 py-2 text-sm font-medium">
                {themes[currentTheme]?.title || "Theme"}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      
      <FontsDrawer
        open={fontsDrawerOpen}
        onOpenChange={setFontsDrawerOpen}
        pageDetails={pageDetails}
        setPageDetails={setPageDetails}
      />

      <CssVariablesDrawer
        open={cssVarsDrawerOpen}
        onOpenChange={setCssVarsDrawerOpen}
        pageDetails={pageDetails}
        setPageDetails={setPageDetails}
      />
    </>
  );
} 