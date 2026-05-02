import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, ADMIN_FINANCE } from "@/lib/rbac";

export const dynamic = "force-dynamic";
import { startOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  const a = await requireAuth(...ADMIN_FINANCE);
  if (!a.ok) return a.response;

  const now = new Date();

  // last 6 months revenue
  const revenueByMonth = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const start = startOfMonth(month);
      const end = startOfMonth(subMonths(month, -1));
      return prisma.payment
        .aggregate({
          where: { status: "COMPLETED", paidAt: { gte: start, lt: end } },
          _sum: { amount: true },
        })
        .then((r) => ({
          month: format(month, "MMM"),
          revenue: r._sum.amount ?? 0,
        }));
    })
  );

  // students with pending payments
  const studentsWithDebt = await prisma.student.findMany({
    where: {
      payments: { some: { status: "PENDING" } },
    },
    include: {
      payments: { where: { status: "PENDING" } },
    },
  });

  // courses with most enrollments
  const topCourses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });

  return NextResponse.json({ revenueByMonth, studentsWithDebt, topCourses });
}
