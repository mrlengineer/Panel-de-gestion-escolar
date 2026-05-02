import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, getInitials } from "@/lib/utils";
import { Enrollment, Student, Course, EnrollmentStatus } from "@/types";
import { ClipboardList, ArrowRight } from "lucide-react";

interface Props {
  enrollments: (Enrollment & { student: Student; course: Course })[];
}

function statusVariant(status: EnrollmentStatus) {
  if (status === "PAID") return "success";
  if (status === "PENDING") return "warning";
  return "danger";
}

export default function RecentEnrollments({ enrollments }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[13px] font-semibold text-text-primary">Recent Enrollments</h2>
          <p className="text-xs text-text-muted mt-0.5">Latest activity in your school</p>
        </div>
        <Link
          href="/dashboard/enrollments"
          className="flex items-center gap-1 text-xs text-accent-light hover:text-accent transition-colors font-medium"
        >
          View all
          <ArrowRight size={11} />
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary">No enrollments yet</p>
          <p className="text-xs text-text-muted mt-1">Enroll your first student to get started.</p>
        </div>
      ) : (
        <div>
          {enrollments.map((e, i) => (
            <div
              key={e.id}
              className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0 hover:bg-surface-2/30 -mx-2 px-2 rounded-lg transition-colors"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {getInitials(`${e.student.firstName} ${e.student.lastName}`)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {e.student.firstName} {e.student.lastName}
                </p>
                <p className="text-xs text-text-muted truncate">{e.course.name}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <Badge variant={statusVariant(e.status)}>
                  {e.status.toLowerCase()}
                </Badge>
                <p className="text-[11px] text-text-muted">{formatDate(e.enrolledAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
