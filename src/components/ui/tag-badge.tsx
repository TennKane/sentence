import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
        "bg-accent/10 text-accent-dark border border-accent/20",
      )}
    >
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 inline-flex hover:text-accent transition-colors"
          aria-label={`移除标签 ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
