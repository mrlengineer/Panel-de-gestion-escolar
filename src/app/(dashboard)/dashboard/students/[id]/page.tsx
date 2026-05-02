import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) notFound();

  const totalPaid = student.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = student.payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const initials = `${student.firstName[0]}${student.lastName[0]}`;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back link */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        Back to students
      </Link>

      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.1),_transparent_70%)]" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-accent/30 border-2 border-accent/40 flex items-center justify-center text-xl font-bold text-accent flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant={student.status === "ACTIVE" ? "success" : "default"}>
                {student.status.toLowerCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-text-muted">
                <Mail size={13} />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Phone size={13} />
                  {student.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-text-muted">
                <Calendar size={13} />
                Joined {formatDate(student.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-success/20 bg-success/5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-text-muted mt-1">
            {student.payments.filter((p) => p.status === "COMPLETED").length} completed payments
          </p>
        </Card>
        <Card className={totalPending > 0 ? "border-warning/20 bg-warning/5" : ""}>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Pending Balance</p>
          <p className={`text-3xl font-bold ${totalPending > 0 ? "text-warning" : "text-text-muted"}`}>
            {formatCurrency(totalPending)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {student.payments.filter((p) => p.status === "PENDING").length} pending payments
          </p>
        </Card>
      </div>

      {/* Enrolled courses */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Enrolled Courses
          <span className="ml-2 text-xs font-normal text-text-muted">
            ({student.enrollments.length})
          </span>
        </h3>
        {student.enrollments.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">Not enrolled in any courses.</p>
        ) : (
          <div className="space-y-0">
            {student.enrollments.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm text-text-primary font-medium">{e.course.name}</p>
                  <p className="text-xs text-text-muted">{e.course.schedule}</p>
                </div>
                <Badge
                  variant={
                    e.status === "PAID" ? "success"
                    : e.status === "PENDING" ? "warning"
                    : "danger"
                  }
                >
                  {e.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment history */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Payment History
          <span className="ml-2 text-xs font-normal text-text-muted">
            ({student.payments.length})
          </span>
        </h3>
        {student.payments.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">No payment records.</p>
        ) : (
          <div className="space-y-0">
            {student.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm text-text-primary font-semibold">
                    {formatCurrency(p.amount)}
                  </p>
                  <p className="text-xs text-text-muted capitalize">
                    {p.method.toLowerCase()} &middot; {formatDate(p.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    p.status === "COMPLETED" ? "success"
                    : p.status === "PENDING" ? "warning"
                    : "default"
                  }
                >
                  {p.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
