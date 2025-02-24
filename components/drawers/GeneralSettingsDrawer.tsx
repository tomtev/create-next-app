import { Drawer } from "@/components/ui/drawer";
import { GeneralSettingsTab } from "@/components/tabs/GeneralSettingsTab";
import { PageData } from "@/types";
import { Settings } from "lucide-react";

interface GeneralSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  focusField?: 'title' | 'description' | 'image';
}

export function GeneralSettingsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
  focusField,
}: GeneralSettingsDrawerProps) {
  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      hasContainer
      title="General Settings"
      icon={<Settings className="h-5 w-5" />}
      closeButton>
      <div className="space-y-4">
        <GeneralSettingsTab
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
          focusField={focusField}
        />
      </div>
    </Drawer>
  );
} 