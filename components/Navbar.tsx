import { Button } from "@/components/ui/button";
import { Plus, Settings2, Palette } from "lucide-react";

interface NavbarProps {
  onAddLinkClick: () => void;
  onSettingsClick: () => void;
  onDesignClick: () => void;
}

export function Navbar({
  onAddLinkClick,
  onSettingsClick,
  onDesignClick,
}: NavbarProps) {
  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 flex justify-center items-center animate-slide-up">
      <div className="flex items-center bg-background p-1 border shadow-brutalist-sm border-primary rounded-full justify-between w-[220px]">
        <button
          className="flex items-center gap-5 p-2 border border-primary px-5 bg-green-300 hover:bg-green-400 rounded-full"
          onClick={onAddLinkClick}>
          <Plus className="h-6 w-6" />
        </button>

        <button
          className="flex items-center gap-5 p-2 px-5 hover:bg-muted rounded-full"
          onClick={onSettingsClick}>
          <Settings2 className="h-6 w-6" />
        </button>

        <button
          className="flex items-center gap-5 p-2 px-5 hover:bg-muted rounded-full"
          onClick={onDesignClick}>
          <Palette className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
