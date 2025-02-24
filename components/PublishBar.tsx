import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Loader from "@/components/ui/loader";

interface PublishBarProps {
  isSaving: boolean;
  onSave: () => void;
}

export function PublishBar({
  isSaving,
  onSave,
}: PublishBarProps) {
  const router = useRouter();

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
          <Link href={`/${router.query.page}`}>
            <Button variant="outline" size={"icon"}>
              <X />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
