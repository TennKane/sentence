import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const paperVariants = cva(
  "rounded-lg border paper-texture overflow-hidden",
  {
    variants: {
      elevation: {
        flat: "border-border bg-paper shadow-none",
        raised: "border-border bg-paper shadow-md shadow-stone-200/50",
        lifted: "border-border bg-paper shadow-xl shadow-stone-300/40",
      },
    },
    defaultVariants: {
      elevation: "raised",
    },
  },
);

interface PaperCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paperVariants> {}

export function PaperCard({
  className,
  elevation,
  children,
  ...props
}: PaperCardProps) {
  return (
    <div className={cn(paperVariants({ elevation }), className)} {...props}>
      <div className="relative p-4">{children}</div>
    </div>
  );
}
