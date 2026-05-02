import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import StatCard from "@/components/dashboard/StatCard";
import RecentEnrollments from "@/components/dashboard/RecentEnrollments";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalStudents,
    activeStudents,
    activeCourses,
    pendingPayments,
    monthlyRevenue,
    recentEnrollments,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.course.count(),
    prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.enrollment.findMany({
      take: 6,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: true,
        course: true,
      },
    }),
  ]);

  return {
    totalStudents,
    activeStudents,
    activeCourses,
    pendingPayments: pendingPayments._sum.amount ?? 0,
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
    recentEnrollments,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const now = new Date();

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted mb-1">
            {dayName}, {dateStr}
          </p>
          <h2 className="text-xl font-bold text-text-primary">
            Good{now.getHours() < 12 ? " morning" : now.getHours() < 18 ? " afternoon" : " evening"} 👋
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/20 bg-success/5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">System online</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          title="Total Students"
          value={data.totalStudents.toString()}
          sub={`${data.activeStudents} active`}
          icon={<Users size={18} />}
          color="accent"
        />
        <StatCard
          title="Active Courses"
          value={data.activeCourses.toString()}
          sub="currently running"
          icon={<BookOpen size={18} />}
          color="success"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(data.pendingPayments)}
          sub="needs collection"
          icon={<CreditCard size={18} />}
          color="warning"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          sub={now.toLocaleString("default", { month: "long" })}
          icon={<TrendingUp size={18} />}
          color="success"
        />
      </div>

      {/* Recent enrollments */}
      <RecentEnrollments enrollments={data.recentEnrollments} />
    </div>
  );
}
