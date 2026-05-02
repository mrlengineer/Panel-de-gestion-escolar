"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, BookOpen } from "lucide-react";
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
      <div className="flex items-center justify-between">
        {!loading && courses.length > 0 && (
          <p className="text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{courses.length}</span> course{courses.length !== 1 ? "s" : ""}
          </p>
        )}
        <div className="ml-auto">
          {isAdmin && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} />
              Add Course
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-56" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-1.5 w-full rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <BookOpen size={22} className="text-text-muted" />
          </div>
            <p className="font-medium text-text-primary">No courses yet</p>
            <p className="text-sm text-text-muted mt-1">Add your first course to get started.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => {
            const pct = (course._count.enrollments / course.maxCapacity) * 100;
            const isFull = pct >= 100;

            return (
              <Card key={course.id} className="flex flex-col gap-4 hover:border-border-light hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{course.name}</h3>
                    {course.description && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <Badge variant="info" className="flex-shrink-0">
                    {formatCurrency(course.monthlyPrice)}/mo
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-text-muted">
                  <p className="text-xs">{course.schedule}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        {course._count.enrollments} / {course.maxCapacity} students
                      </span>
                      {isFull && <Badge variant="danger">Full</Badge>}
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          pct >= 100 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs">
                    Teacher:{" "}
                    <span className="text-text-primary font-medium">{course.teacher.name}</span>
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setEditTarget(course); setShowForm(true); }}
                    >
                      <Pencil size={13} />
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
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
