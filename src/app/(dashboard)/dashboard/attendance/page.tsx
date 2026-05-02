"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { AttendanceWithDetails } from "@/types";
import { CalendarCheck } from "lucide-react";

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

interface Course { id: string; name: string; }
interface Student { id: string; firstName: string; lastName: string; }

const ATT_BUTTONS: { value: AttStatus; label: string; active: string; inactive: string }[] = [
  {
    value: "PRESENT",
    label: "Present",
    active: "bg-success text-white shadow-sm shadow-success/30",
    inactive: "bg-surface-2 text-text-muted hover:bg-border hover:text-text-primary",
  },
  {
    value: "ABSENT",
    label: "Absent",
    active: "bg-danger text-white shadow-sm shadow-danger/30",
    inactive: "bg-surface-2 text-text-muted hover:bg-border hover:text-text-primary",
  },
  {
    value: "LATE",
    label: "Late",
    active: "bg-warning text-black shadow-sm shadow-warning/20",
    inactive: "bg-surface-2 text-text-muted hover:bg-border hover:text-text-primary",
  },
];

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
    ]).then(([c, s]) => {
      setCourses(c);
      setStudents(s);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/attendance?courseId=${selectedCourse}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => { setAttendance(data); setLoading(false); });
  }, [selectedCourse, selectedDate]);

  const getStatus = (studentId: string): AttStatus | undefined =>
    attendance.find((a) => a.studentId === studentId)?.status as AttStatus | undefined;

  const markAttendance = async (studentId: string, status: AttStatus) => {
    setSaving(studentId);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId: selectedCourse, date: selectedDate, status }),
    });
    const updated = await fetch(
      `/api/attendance?courseId=${selectedCourse}&date=${selectedDate}`
    ).then((r) => r.json());
    setAttendance(updated);
    setSaving(null);
  };

  const statusVariant = (status?: AttStatus) => {
    if (status === "PRESENT") return "success";
    if (status === "LATE") return "warning";
    if (status === "ABSENT") return "danger";
    return "default";
  };

  const presentCount = students.filter((s) => getStatus(s.id) === "PRESENT").length;
  const absentCount  = students.filter((s) => getStatus(s.id) === "ABSENT").length;
  const lateCount    = students.filter((s) => getStatus(s.id) === "LATE").length;
  const unmarked     = students.filter((s) => !getStatus(s.id)).length;

  return (
    <div className="space-y-5">
      {/* Filter card */}
      <Card>
        <div className="flex items-end gap-5 flex-wrap">
          <Select
            label="Course"
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={[
              { label: "Select a course…", value: "" },
              ...courses.map((c) => ({ label: c.name, value: c.id })),
            ]}
            className="w-60"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium text-text-primary">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60"
            />
          </div>
        </div>
      </Card>

      {/* Only show after a course is selected */}
      {selectedCourse && (
        <>
          {/* Summary stats */}
          {!loading && students.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-success/5 border border-success/20 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-success">{presentCount}</p>
                <p className="text-xs text-text-muted mt-0.5">Present</p>
              </div>
              <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-danger">{absentCount}</p>
                <p className="text-xs text-text-muted mt-0.5">Absent</p>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-warning">{lateCount}</p>
                <p className="text-xs text-text-muted mt-0.5">Late</p>
              </div>
              <div className="bg-surface-2 border border-border rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-text-muted">{unmarked}</p>
                <p className="text-xs text-text-muted mt-0.5">Not marked</p>
              </div>
            </div>
          )}

          {/* Attendance list */}
          <Card>
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 border-b border-border/50 last:border-0">
                    <div className="skeleton h-8 w-8 rounded-full" />
                    <div className="flex-1 skeleton h-4 w-36" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="flex gap-2">
                      <div className="skeleton h-7 w-16 rounded-md" />
                      <div className="skeleton h-7 w-14 rounded-md" />
                      <div className="skeleton h-7 w-12 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="py-14 text-center">
                <CalendarCheck size={36} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="font-medium text-text-primary">No students found</p>
                <p className="text-sm text-text-muted mt-1">Add students to start tracking attendance.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 py-2 px-4 border-b border-border mb-1">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Student</span>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Status</span>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Mark</span>
                </div>

                {students.map((s) => {
                  const status = getStatus(s.id);
                  const isSaving = saving === s.id;

                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 px-4 border-b border-border/50 last:border-0 hover:bg-surface-2/40 rounded-lg transition-colors"
                    >
                      {/* Student info */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>

                      {/* Current status */}
                      <Badge variant={statusVariant(status)}>
                        {status ? status.toLowerCase() : "—"}
                      </Badge>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {ATT_BUTTONS.map((btn) => (
                          <button
                            key={btn.value}
                            onClick={() => markAttendance(s.id, btn.value)}
                            disabled={isSaving}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all disabled:opacity-40 ${
                              status === btn.value ? btn.active : btn.inactive
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {!selectedCourse && (
        <div className="py-16 text-center text-text-muted">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select a course above to start marking attendance.</p>
        </div>
      )}
    </div>
  );
}
