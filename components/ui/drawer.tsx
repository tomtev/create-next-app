"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  direction?: "bottom" | "right" | "left";
};

const Drawer = ({
  shouldScaleBackground = true,
  direction = "bottom",
  ...props
}: DrawerProps) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      direction={isMobile ? "bottom" : direction}
      {...props}
    />
  );
};
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-40 bg-background/40", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  direction?: "bottom" | "right" | "left";
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, direction = "bottom", ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const styles = {
    bottom: "fixed inset-x-2 bottom-2 flex h-auto max-h-[0vh] md:h-auto outline-none flex-col z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600",
    right: "fixed inset-x-2 md:left-auto md:inset-y-2 md:right-2 md:w-[340px] bottom-2 max-h-[60vh] md:max-h-[100vh] outline-none flex z-50 data-[state=open]:animate-in data-[state=closed]:animate-out md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600",
    left: "fixed inset-x-2 md:right-auto md:inset-y-2 md:left-2 md:w-[340px] bottom-2 max-h-[60vh] md:max-h-[100vh] outline-none flex z-50 data-[state=open]:animate-in data-[state=closed]:animate-out md:data-[state=closed]:slide-out-to-left md:data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-600"
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          styles[direction],
          className
        )}
        {...props}>
        <div className={cn(
          "border border-primary max-h-[60vh] shadow-brutalist h-full w-full grow p-5 flex flex-col rounded-md bg-background",
          "overflow-y-auto overscroll-contain touch-pan-y"
        )}>
          {children}
        </div>
        {(direction === "bottom" || (["left", "right"].includes(direction) && isMobile)) && (
          <div className="absolute top-2 w-[50px] h-[3px] left-1/2 -translate-x-1/2 rounded-full bg-gray-300">
          </div>
        )}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 py-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
