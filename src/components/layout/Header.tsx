"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="bg-surface border-b border-border px-6 py-4 min-h-[64px] flex items-center">
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        {segments.length > 1 && (
          <div className="flex items-center gap-1 mb-1">
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={11} className="text-text-muted" />}
                <span
                  className={
                    i === segments.length - 1
                      ? "text-[11px] text-text-secondary font-medium capitalize"
                      : "text-[11px] text-text-muted capitalize"
                  }
                >
                  {seg}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[15px] font-semibold text-text-primary leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
