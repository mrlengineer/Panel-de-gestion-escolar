import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          {
            "bg-accent hover:bg-accent-hover text-white shadow-sm hover:shadow-accent-glow": variant === "primary",
            "bg-surface-2 hover:bg-surface-3 text-text-primary border border-border hover:border-border-light": variant === "secondary",
            "text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg": variant === "ghost",
            "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20": variant === "danger",
          },
          {
            "text-xs px-2.5 py-1.5": size === "sm",
            "text-sm px-4 py-2": size === "md",
            "text-sm px-5 py-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
