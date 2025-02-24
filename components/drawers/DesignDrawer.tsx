import { Drawer } from "@/components/ui/drawer";
import { DesignTab } from "@/components/tabs/DesignTab";
import { PageData } from "@/types";
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
  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      title="Design"
      icon={<Palette className="h-5 w-5" />}
      closeButton>
      <DesignTab
        pageDetails={pageDetails}
        setPageDetails={setPageDetails}
      />
    </Drawer>
  );
} 