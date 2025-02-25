import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface RotatingCoinProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  rotationSpeed?: "slow" | "normal" | "fast";
  shineEffect?: boolean;
  coinColor?: string;
  depth?: "thin" | "medium" | "thick";
}

export function RotatingCoin({
  src,
  alt,
  size = "md",
  className,
  rotationSpeed = "normal",
  shineEffect = true,
  coinColor = "#f59e0b", // Default to amber/gold color
  depth = "medium",
}: RotatingCoinProps) {
  // Size mapping
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Speed mapping
  const speedClasses = {
    slow: "animate-rotate3d-slow",
    normal: "animate-rotate3d",
    fast: "animate-rotate3d-fast",
  };

  // Calculate edge thickness based on size
  const getEdgeThickness = () => {
    switch (size) {
      case "sm": return "2px";
      case "md": return "3px";
      case "lg": return "4px";
      case "xl": return "5px";
      default: return "3px";
    }
  };

  // Calculate depth offset based on depth setting
  const getDepthOffset = () => {
    const baseDepth = {
      sm: { thin: 1, medium: 2, thick: 3 },
      md: { thin: 2, medium: 3, thick: 4 },
      lg: { thin: 3, medium: 4, thick: 6 },
      xl: { thin: 4, medium: 6, thick: 8 },
    };
    
    return baseDepth[size]?.[depth] || 3;
  };

  const depthOffset = getDepthOffset();

  return (
    <div className="relative inline-block perspective-1000">
      {/* Main coin container */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden transform-style-3d",
          sizeClasses[size],
          speedClasses[rotationSpeed],
          className
        )}
        style={{
          boxShadow: `0 0 10px rgba(0, 0, 0, 0.2)`,
        }}
      >
        {/* Coin face (front) */}
        <div className="absolute inset-0 z-10 rounded-full overflow-hidden backface-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
          
          {/* Beveled edge overlay - top */}
          <div 
            className="absolute top-0 left-0 right-0 rounded-t-full"
            style={{
              height: getEdgeThickness(),
              background: `linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)`,
              opacity: 0.7,
            }}
          />
          
          {/* Beveled edge overlay - bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 rounded-b-full"
            style={{
              height: getEdgeThickness(),
              background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)`,
              opacity: 0.7,
            }}
          />
          
          {/* Left edge highlight */}
          <div 
            className="absolute top-0 bottom-0 left-0 w-1"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.5), transparent)`,
              opacity: 0.7,
            }}
          />
          
          {/* Right edge shadow */}
          <div 
            className="absolute top-0 bottom-0 right-0 w-1"
            style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.3), transparent)`,
              opacity: 0.7,
            }}
          />
          
          {/* Shine effect */}
          {shineEffect && (
            <div 
              className="absolute inset-0 animate-shine opacity-0"
              style={{
                background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)",
                backgroundSize: "200% 200%",
              }}
            />
          )}
        </div>
        
        {/* Coin edge (side) - multiple layers for depth */}
        {Array.from({ length: depthOffset }).map((_, index) => (
          <div 
            key={`edge-${index}`}
            className="absolute inset-0 rounded-full transform-style-3d backface-hidden"
            style={{
              transform: `translateZ(-${index + 1}px)`,
              background: coinColor,
              opacity: 1 - (index * 0.1),
              boxShadow: index === 0 ? `inset 0 0 ${getEdgeThickness()} rgba(0, 0, 0, 0.5)` : 'none',
            }}
          />
        ))}
        
        {/* Coin back */}
        <div 
          className="absolute inset-0 rounded-full backface-hidden"
          style={{
            transform: `rotateY(180deg) translateZ(-${depthOffset}px)`,
            background: coinColor,
            boxShadow: `inset 0 0 ${getEdgeThickness()} rgba(0, 0, 0, 0.3)`,
          }}
        >
          {/* Back face texture/pattern */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.3) 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
} 