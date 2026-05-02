import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        {
          "bg-surface-2 text-text-muted border-border": variant === "default",
          "bg-success/10 text-success border-success/30": variant === "success",
          "bg-warning/10 text-warning border-warning/30": variant === "warning",
          "bg-danger/10 text-danger border-danger/30": variant === "danger",
          "bg-accent/10 text-accent border-accent/30": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
