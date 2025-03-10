import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Loader from "@/components/ui/loader";
import { useState } from "react";

interface PublishBarProps {
  isSaving: boolean;
  onSave: () => void;
}

export function PublishBar({ isSaving, onSave }: PublishBarProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = async () => {
    setIsExiting(true);
    await router.push(`/${router.query.page}`);
  };

  return (
    <>
      {/* Top bar with save controls */}
      <div className="fixed top-2 right-2 z-40 animate-slide-down">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader className="h-4 w-4" />
                <span>Saving...</span>
              </>
            ) : (
              "Publish"
            )}
          </Button>
          <Button variant="outline" size={"icon"} onClick={handleExit} disabled={isExiting}>
            {isExiting ? <Loader className="h-4 w-4" /> : <X />}
          </Button>
        </div>
      </div>
    </>
  );
}
