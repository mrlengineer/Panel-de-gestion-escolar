"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface DebtStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  payments: { amount: number }[];
}

interface TopCourse {
  id: string;
  name: string;
  teacher: { name: string };
  _count: { enrollments: number };
  maxCapacity: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<{
    revenueByMonth: RevenuePoint[];
    studentsWithDebt: DebtStudent[];
    topCourses: TopCourse[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <p className="text-text-muted text-sm">Loading reports...</p>;
  }

  const totalRevenue = data.revenueByMonth.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Monthly Revenue</h2>
              <p className="text-xs text-text-muted mt-0.5">Last 6 months</p>
            </div>
            <p className="text-sm font-bold text-success">{formatCurrency(totalRevenue)}</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenueByMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3147" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#7b8098", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8098", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "#1a1d27", border: "1px solid #2e3147", borderRadius: 8 }}
                labelStyle={{ color: "#e8eaf0" }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Top Courses by Enrollment</h2>
          {data.topCourses.length === 0 ? (
            <p className="text-text-muted text-sm">No data.</p>
          ) : (
            <div className="space-y-3">
              {data.topCourses.map((course, i) => {
                const fill = (course._count.enrollments / course.maxCapacity) * 100;
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                        <p className="text-sm text-text-primary">{course.name}</p>
                      </div>
                      <span className="text-xs text-text-muted">
                        {course._count.enrollments}/{course.maxCapacity}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${Math.min(fill, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Students with Pending Payments</h2>
        {data.studentsWithDebt.length === 0 ? (
          <p className="text-text-muted text-sm">No pending balances.</p>
        ) : (
          <div className="space-y-2">
            {data.studentsWithDebt.map((s) => {
              const total = s.payments.reduce((sum, p) => sum + p.amount, 0);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-text-muted">{s.email}</p>
                  </div>
                  <Badge variant="warning">{formatCurrency(total)} pending</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
