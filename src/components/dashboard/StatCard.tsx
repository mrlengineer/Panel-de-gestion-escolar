import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: "accent" | "success" | "warning" | "danger";
}

const colorStripe: Record<string, string> = {
  accent:  "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
};

const colorIcon: Record<string, string> = {
  accent:  "bg-accent/10 text-accent-light",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
};

export default function StatCard({ title, value, sub, icon, color = "accent" }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-default p-5">
      {/* Top accent stripe */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px]", colorStripe[color])} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">
            {title}
          </p>
          <p className="text-[28px] font-bold text-text-primary mt-2 tabular-nums leading-none">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-text-muted mt-2">{sub}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorIcon[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
