"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-white">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs text-text-muted capitalize mt-0.5">
              {session?.user?.role?.toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-text-muted hover:text-danger transition-colors"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
