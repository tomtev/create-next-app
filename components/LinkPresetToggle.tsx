import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LinkPreset, getLinkPresetsByGroup } from "@/lib/linkPresets";
import { cn } from "@/lib/utils";

interface LinkPresetToggleProps {
  selectedPresets: string[];
  onTogglePreset: (presetId: string, checked: boolean) => void;
  showGroups?: boolean;
  className?: string;
}

export default function LinkPresetToggle({
  selectedPresets,
  onTogglePreset,
  showGroups = true,
  className,
}: LinkPresetToggleProps) {
  const socialPresets = getLinkPresetsByGroup('social');
  const tokenPresets = getLinkPresetsByGroup('token');

  const PresetItem = ({ preset }: { preset: LinkPreset }) => (
    <Card
      key={preset.id}
      className={cn(
        "p-3 cursor-pointer transition-colors",
        selectedPresets.includes(preset.id)
          ? "bg-violet-50 border-violet-500"
          : "hover:border-violet-300",
      )}
    >
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={selectedPresets.includes(preset.id)}
          onCheckedChange={(checked) => {
            onTogglePreset(preset.id, !!checked);
          }}
        />
        {preset.icon && <preset.icon className="h-4 w-4" />}
        <span className="text-sm">{preset.title}</span>
      </div>
    </Card>
  );

  if (!showGroups) {
    // Show all presets in a single list
    return (
      <div className={cn("grid grid-cols-1 gap-2", className)}>
        {[...socialPresets, ...tokenPresets].map((preset) => (
          <PresetItem key={preset.id} preset={preset} />
        ))}
      </div>
    );
  }

  // Show presets grouped by type
  return (
    <div className={cn("space-y-6", className)}>
      {/* Social Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
        <div className="grid grid-cols-1 gap-2">
          {socialPresets.map((preset) => (
            <PresetItem key={preset.id} preset={preset} />
          ))}
        </div>
      </div>

      {/* Token/Blockchain Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Token Links</h3>
        <div className="grid grid-cols-1 gap-2">
          {tokenPresets.map((preset) => (
            <PresetItem key={preset.id} preset={preset} />
          ))}
        </div>
      </div>
    </div>
  );
} 