import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface PaperInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PaperInput = forwardRef<HTMLInputElement, PaperInputProps>(
  ({ className, label, id, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm text-ink-light font-medium"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-ink placeholder:text-ink-muted",
            "focus:outline-hidden transition-colors",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
PaperInput.displayName = "PaperInput";
