import { useRouter } from "next/router";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";

interface EditButtonProps {
  slug: string;
}

const EditButton = ({ slug }: EditButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    await router.push(`/edit/${slug}`);
  };

  return (
    <div className="-mt-12">
      <Button
        onClick={handleEdit}
        size="sm"
        disabled={isLoading}
        className="relative left-1/2 -translate-x-1/2">
        {isLoading ? (
          <Loader className="h-4 w-4 mr-2" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        )}
        Edit Page
      </Button>
    </div>
  );
};

export default EditButton;
