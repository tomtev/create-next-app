import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Loader from "@/components/ui/loader";

interface EditButtonProps {
  slug: string;
}

export default function EditButton({ slug }: EditButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      size="icon"
      variant="theme"
      className="fixed top-2 right-2"
      onClick={async () => {
        setIsLoading(true);
        await router.push(`/edit/${slug}`);
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader className="h-4 w-4" />
      ) : (
        <Pencil className="h-4 w-4" />
      )}
    </Button>
  );
} 