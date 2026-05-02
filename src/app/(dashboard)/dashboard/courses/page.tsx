"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import CourseForm from "@/components/courses/CourseForm";
import { CourseWithTeacher } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export default function CoursesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CourseWithTeacher | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This will also remove all enrollments.")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    fetchCourses();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditTarget(null);
    fetchCourses();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Add Course
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{course.name}</h3>
                  {course.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{course.description}</p>
                  )}
                </div>
                <Badge variant="info">{formatCurrency(course.monthlyPrice)}/mo</Badge>
              </div>

              <div className="space-y-2 text-sm text-text-muted">
                <p>{course.schedule}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Users size={12} />
                      {course._count.enrollments} / {course.maxCapacity} students
                    </span>
                    {course._count.enrollments >= course.maxCapacity && (
                      <Badge variant="danger">Full</Badge>
                    )}
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        (course._count.enrollments / course.maxCapacity) >= 1
                          ? "bg-danger"
                          : (course._count.enrollments / course.maxCapacity) >= 0.75
                          ? "bg-warning"
                          : "bg-success"
                      )}
                      style={{
                        width: `${Math.min((course._count.enrollments / course.maxCapacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs">
                  Teacher: <span className="text-text-primary">{course.teacher.name}</span>
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-1 border-t border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setEditTarget(course); setShowForm(true); }}
                  >
                    <Pencil size={13} />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {courses.length === 0 && (
            <p className="text-text-muted text-sm col-span-full text-center py-10">
              No courses yet.
            </p>
          )}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        title={editTarget ? "Edit Course" : "Add Course"}
      >
        <CourseForm
          course={editTarget}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
}
