"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/students": "Students",
  "/dashboard/courses": "Courses",
  "/dashboard/enrollments": "Enrollments",
  "/dashboard/payments": "Payments",
  "/dashboard/attendance": "Attendance",
  "/dashboard/reports": "Reports",
};

function getTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  return pageTitles[base] ?? "Dashboard";
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
