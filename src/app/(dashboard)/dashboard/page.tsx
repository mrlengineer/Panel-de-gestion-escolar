import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
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
      take: 5,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data.totalStudents.toString()}
          sub={`${data.activeStudents} active`}
          icon={<Users size={20} />}
          color="accent"
        />
        <StatCard
          title="Active Courses"
          value={data.activeCourses.toString()}
          sub="currently running"
          icon={<BookOpen size={20} />}
          color="success"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(data.pendingPayments)}
          sub="needs collection"
          icon={<CreditCard size={20} />}
          color="warning"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          sub={`${new Date().toLocaleString("default", { month: "long" })}`}
          icon={<TrendingUp size={20} />}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentEnrollments enrollments={data.recentEnrollments} />
      </div>
    </div>
  );
}
