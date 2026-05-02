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
import { formatCurrency, getInitials } from "@/lib/utils";
import { TrendingUp, BookOpen, AlertCircle, Search } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";

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
  const [debtSearch, setDebtSearch] = useState("");

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card>
            <div className="space-y-3 mb-4">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-52 w-full rounded-lg" />
          </Card>
          <Card>
            <div className="skeleton h-4 w-44 mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-3 w-32" />
                  <div className="skeleton h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card>
          <div className="skeleton h-4 w-52 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-36" />
                <div className="skeleton h-2.5 w-44" />
              </div>
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const totalRevenue = data.revenueByMonth.reduce((s, r) => s + r.revenue, 0);

  const dq = debtSearch.toLowerCase();
  const filteredDebt = debtSearch
    ? data.studentsWithDebt.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(dq) ||
          s.email.toLowerCase().includes(dq)
      )
    : data.studentsWithDebt;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <Card>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Monthly Revenue</h2>
              <p className="text-xs text-text-muted mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-success" />
              <p className="text-sm font-bold text-success">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
          {data.revenueByMonth.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-text-muted text-sm">No revenue data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.revenueByMonth} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3147" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#7b8098", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#7b8098", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1d27",
                    border: "1px solid #2e3147",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e8eaf0", marginBottom: 4 }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top courses */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={14} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">Top Courses by Enrollment</h2>
          </div>
          {data.topCourses.length === 0 ? (
            <p className="text-text-muted text-sm">No course data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topCourses.map((course, i) => {
                const fill = (course._count.enrollments / course.maxCapacity) * 100;
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-text-muted w-4 flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary truncate font-medium">
                            {course.name}
                          </p>
                          <p className="text-xs text-text-muted">{course.teacher.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-text-muted flex-shrink-0 ml-3">
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

      {/* Students with pending balance */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-warning" />
            <h2 className="text-sm font-semibold text-text-primary">Students with Pending Balance</h2>
            {data.studentsWithDebt.length > 0 && (
              <span className="text-xs text-text-muted">({data.studentsWithDebt.length})</span>
            )}
          </div>
          {data.studentsWithDebt.length > 0 && (
            <SearchInput
              value={debtSearch}
              onChange={setDebtSearch}
              placeholder="Search by name or email…"
              className="w-56"
            />
          )}
        </div>
        {data.studentsWithDebt.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-success font-medium">All caught up!</p>
            <p className="text-xs text-text-muted mt-1">No students have pending balances.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredDebt.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">No results for &ldquo;{debtSearch}&rdquo;</p>
            ) : filteredDebt.map((s) => {
              const total = s.payments.reduce((sum, p) => sum + p.amount, 0);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 hover:bg-surface-2/40 -mx-1 px-1 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center text-xs font-semibold text-warning flex-shrink-0">
                    {getInitials(`${s.firstName} ${s.lastName}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-text-muted truncate">{s.email}</p>
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
