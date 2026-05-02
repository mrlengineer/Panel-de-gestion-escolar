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
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide",
        {
          "bg-surface-3 text-text-secondary border border-border": variant === "default",
          "bg-success/10 text-success border border-success/20": variant === "success",
          "bg-warning/10 text-warning border border-warning/20": variant === "warning",
          "bg-danger/10 text-danger border border-danger/20": variant === "danger",
          "bg-accent/10 text-accent-light border border-accent/20": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
