import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
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
        <div className="space-y-3">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {e.student.firstName} {e.student.lastName}
                </p>
                <p className="text-xs text-text-muted">{e.course.name}</p>
              </div>
              <div className="text-right">
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
