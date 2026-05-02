import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, getInitials } from "@/lib/utils";
import { Enrollment, Student, Course, EnrollmentStatus } from "@/types";

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
      <h2 className="text-sm font-semibold text-text-primary mb-4">Recent Enrollments</h2>
      {enrollments.length === 0 ? (
        <p className="text-text-muted text-sm">No enrollments yet.</p>
      ) : (
        <div className="space-y-1">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                {getInitials(`${e.student.firstName} ${e.student.lastName}`)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {e.student.firstName} {e.student.lastName}
                </p>
                <p className="text-xs text-text-muted truncate">{e.course.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <Badge variant={statusVariant(e.status)}>
                  {e.status.toLowerCase()}
                </Badge>
                <p className="text-xs text-text-muted mt-1">{formatDate(e.enrolledAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
