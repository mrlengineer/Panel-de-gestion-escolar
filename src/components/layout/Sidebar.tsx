"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  BarChart3,
  GraduationCap,
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
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const visible = navItems.filter(
    (item) => !item.roles || !role || item.roles.includes(role)
  );

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">SchoolDesk</p>
            <p className="text-xs text-text-muted">Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visible.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "sidebar-link",
              pathname === href || pathname.startsWith(href + "/") ? "active" : ""
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
              {getInitials(session.user.name ?? "?")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{session.user.name}</p>
              <p className="text-xs text-text-muted capitalize">{session.user.role?.toLowerCase()}</p>
            </div>
          </div>
        )}
        <p className="text-xs text-text-muted text-center">v0.1.0</p>
      </div>
    </aside>
  );
}
