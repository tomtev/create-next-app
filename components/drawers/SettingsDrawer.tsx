import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GeneralSettingsTab } from "@/components/tabs/GeneralSettingsTab";
import { DesignTab } from "@/components/tabs/DesignTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { PageData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  focusField?: 'title' | 'description' | 'image';
}

export function SettingsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
  focusField,
}: SettingsDrawerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pageDetails || deleteConfirmation !== pageDetails.slug) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/page-store", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: pageDetails.slug }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete page");
      }

      toast({
        title: "Page deleted",
        description: "Your page has been successfully deleted.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error deleting page:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete page"
      );
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete page",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right">
        <Accordion type="single" defaultValue={focusField === 'image' ? 'general' : 'general'} collapsible>
          <AccordionItem value="general">
            <AccordionTrigger>General</AccordionTrigger>
            <AccordionContent>
              <GeneralSettingsTab
                pageDetails={pageDetails}
                setPageDetails={setPageDetails}
                focusField={focusField}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="design">
            <AccordionTrigger>Design</AccordionTrigger>
            <AccordionContent>
              <DesignTab
                pageDetails={pageDetails}
                setPageDetails={setPageDetails}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="analytics">
            <AccordionTrigger>Analytics</AccordionTrigger>
            <AccordionContent>
              <AnalyticsTab pageDetails={pageDetails} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="danger" className="border-red-200">
            <AccordionTrigger className="text-red-600">Danger Zone</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delete Page</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a page, there is no going back. Please be certain.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Page
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Delete Page
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                page and remove all data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Please type{" "}
                <span className="font-mono text-gray-900">
                  {pageDetails?.slug}
                </span>{" "}
                to confirm.
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Enter page name to confirm"
                className={deleteError ? "border-red-500" : ""}
              />
              {deleteError && (
                <p className="text-sm text-red-600">{deleteError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation("");
                  setDeleteError(null);
                }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  !pageDetails ||
                  deleteConfirmation !== pageDetails.slug ||
                  isDeleting
                }>
                {isDeleting ? "Deleting..." : "Delete Page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DrawerContent>
    </Drawer>
  );
}
