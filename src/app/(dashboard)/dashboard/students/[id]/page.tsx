import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-5 max-w-4xl">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={15} />
        Back to students
      </Link>

      <Card>
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-text-primary">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant={student.status === "ACTIVE" ? "success" : "default"}>
                {student.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-text-muted text-sm mt-1">{student.email}</p>
            {student.phone && <p className="text-text-muted text-sm">{student.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Joined</p>
            <p className="text-sm text-text-primary">{formatDate(student.createdAt)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Pending Balance</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Enrolled Courses</h3>
        {student.enrollments.length === 0 ? (
          <p className="text-text-muted text-sm">No enrollments.</p>
        ) : (
          <div className="space-y-2">
            {student.enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text-primary font-medium">{e.course.name}</p>
                  <p className="text-xs text-text-muted">{e.course.schedule}</p>
                </div>
                <Badge variant={e.status === "PAID" ? "success" : e.status === "PENDING" ? "warning" : "danger"}>
                  {e.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Payment History</h3>
        {student.payments.length === 0 ? (
          <p className="text-text-muted text-sm">No payments.</p>
        ) : (
          <div className="space-y-2">
            {student.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text-primary font-medium">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-text-muted capitalize">{p.method.toLowerCase()} · {formatDate(p.createdAt)}</p>
                </div>
                <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "warning" : "default"}>
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
