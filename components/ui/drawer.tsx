"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

export interface DrawerProps {
  direction?: "bottom" | "right" | "left";
  title?: string;
  icon?: React.ReactNode;
  backButton?: boolean;
  closeButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hasContainer?: boolean;
  shouldScaleBackground?: boolean;
}

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-40 bg-black/20", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    direction?: "bottom" | "right" | "left";
  }
>(({ className, children, direction = "bottom", ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const styles = {
    bottom:
      "fixed inset-x-2 bottom-0 flex h-auto max-h-[70vh] md:h-auto outline-none !rounded-b-0 flex-col z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600",
    right:
      "fixed inset-x-2 md:left-auto md:top-2 md:right-2 bottom-0 md:bottom-auto md:w-[380px] max-h-[100vh] outline-none flex z-50 data-[state=open]:animate-in data-[state=closed]:animate-out md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600",
    left: "fixed inset-x-2 md:right-auto md:top-2 md:left-2 md:w-[380px] bottom-0 md:bottom-auto max-h-[100vh] outline-none flex z-50 data-[state=open]:animate-in data-[state=closed]:animate-out md:data-[state=closed]:slide-out-to-left md:data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600",
  };

  return (
    <DrawerPrimitive.Portal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(styles[direction], className)}
        {...props}>
        <div
          className={cn(
            "border border-primary max-h-[80vh] md:max-h-[98vh] shadow-brutalist h-full w-full grow p-4 flex flex-col rounded-t-md md:rounded-md bg-background",
            "overflow-y-auto overscroll-contain touch-pan-y"
          )}>
          {children}
        </div>
        {(direction === "bottom" ||
          (["left", "right"].includes(direction) && isMobile)) && (
          <div className="absolute top-2 w-[50px] h-[3px] left-1/2 -translate-x-1/2 rounded-full bg-gray-300"></div>
        )}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});
DrawerContent.displayName = "DrawerContent";

export function Drawer({
  children,
  direction = "bottom",
  title,
  icon,
  backButton,
  closeButton,
  onBack,
  onOpenChange,
  hasContainer,
  ...props
}: DrawerProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={true}
      direction={isMobile ? "bottom" : direction}
      onOpenChange={onOpenChange}
      {...props}>
      <DrawerContent direction={direction}>
        {(title || icon || backButton || closeButton) && (
          <div className="grid gap-1.5 pb-4 pt-2 text-center sm:text-left relative mb-4">
            <div className={cn(hasContainer && "mx-auto w-full max-w-[var(--pf-container-width)]", "flex items-center gap-2")}>
              {backButton && (
                <Button
                  variant="ghost"
                  size="icon_sm"
                  onClick={onBack}
                  className="absolute left-0 top-1 rounded-full bg-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </Button>
              )}
              <div className={cn("flex items-center gap-2", backButton && "ml-9")}>
                {icon}
                {title && (
                  <h2 className="text-lg leading-none tracking-tight">
                    {title}
                  </h2>
                )}
              </div>
              {closeButton && (
                <Button
                  variant="ghost"
                  size="icon_sm"
                  onClick={() => onOpenChange?.(false)}
                  className="absolute right-0 top-0 rounded-full bg-muted">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        <div className={cn(hasContainer && "mx-auto w-full max-w-[var(--pf-container-width)]")}>
          {children}
        </div>
      </DrawerContent>
    </DrawerPrimitive.Root>
  );
}

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;
