import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] tabular-nums",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-muted",
        up: "border-up/30 bg-up/10 text-up",
        warn: "border-warn/30 bg-warn/10 text-warn",
        down: "border-down/30 bg-down/10 text-down",
        accent: "border-accent/30 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
