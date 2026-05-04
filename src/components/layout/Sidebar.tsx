"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  BarChart3,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Role } from "@prisma/client";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { href: "/dashboard",             label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/students",    label: "Students",    icon: Users },
  { href: "/dashboard/courses",     label: "Courses",     icon: BookOpen },
  { href: "/dashboard/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/dashboard/payments",    label: "Payments",    icon: CreditCard,    roles: ["ADMIN", "FINANCE"] },
  { href: "/dashboard/attendance",  label: "Attendance",  icon: CalendarCheck, roles: ["ADMIN", "TEACHER"] },
  { href: "/dashboard/reports",     label: "Reports",     icon: BarChart3,     roles: ["ADMIN", "FINANCE"] },
  { href: "/dashboard/users",       label: "Accounts",    icon: ShieldCheck,   roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const visible = navItems.filter(
    (item) => !item.roles || !role || item.roles.includes(role)
  );

  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-accent-glow shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-primary leading-none">SchoolDesk</p>
            <p className="text-[11px] text-text-muted mt-0.5">Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {visible.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      {session?.user && (
        <div className="px-3 pb-4 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2 border border-border">
            <div className="w-7 h-7 rounded-full bg-gradient-accent flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {getInitials(session.user.name ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-text-primary truncate leading-none">
                {session.user.name}
              </p>
              <p className="text-[11px] text-text-muted capitalize mt-0.5">
                {session.user.role?.toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="text-text-muted hover:text-danger transition-colors shrink-0"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
