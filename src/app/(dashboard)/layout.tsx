"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":             { title: "Dashboard",    subtitle: "Your school at a glance" },
  "/dashboard/students":    { title: "Students",     subtitle: "Manage student records and profiles" },
  "/dashboard/courses":     { title: "Courses",      subtitle: "Manage courses and schedules" },
  "/dashboard/enrollments": { title: "Enrollments",  subtitle: "Track student course enrollments" },
  "/dashboard/payments":    { title: "Payments",     subtitle: "Manage fees and payment records" },
  "/dashboard/attendance":  { title: "Attendance",   subtitle: "Track daily student attendance" },
  "/dashboard/reports":     { title: "Reports",      subtitle: "Analytics and performance reports" },
};

function getMeta(pathname: string) {
  if (pageMeta[pathname]) return pageMeta[pathname];
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  return pageMeta[base] ?? { title: "Dashboard", subtitle: "" };
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = getMeta(pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">{children}</main>
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
