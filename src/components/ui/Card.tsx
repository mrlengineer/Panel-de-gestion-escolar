import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-5 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
