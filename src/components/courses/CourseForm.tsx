"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CourseWithTeacher } from "@/types";

interface Teacher {
  id: string;
  name: string;
}

interface Props {
  course?: CourseWithTeacher | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CourseForm({ course, onSuccess, onCancel }: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    name: course?.name ?? "",
    description: course?.description ?? "",
    monthlyPrice: course?.monthlyPrice?.toString() ?? "",
    schedule: course?.schedule ?? "",
    maxCapacity: course?.maxCapacity?.toString() ?? "",
    teacherId: course?.teacherId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users?role=TEACHER")
      .then((r) => r.json())
      .then(setTeachers);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      monthlyPrice: parseFloat(form.monthlyPrice),
      maxCapacity: parseInt(form.maxCapacity),
    };

    const url = course ? `/api/courses/${course.id}` : "/api/courses";
    const method = course ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSuccess();
    } else {
      setError("Something went wrong. Check all fields.");
    }
    setLoading(false);
  };

  const teacherOptions = [
    { label: "Select teacher", value: "" },
    ...teachers.map((t) => ({ label: t.name, value: t.id })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Course name"
        id="name"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
        required
      />

      <Input
        label="Description"
        id="description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monthly price ($)"
          id="monthlyPrice"
          type="number"
          min="0"
          step="0.01"
          value={form.monthlyPrice}
          onChange={(e) => handleChange("monthlyPrice", e.target.value)}
          required
        />
        <Input
          label="Max capacity"
          id="maxCapacity"
          type="number"
          min="1"
          value={form.maxCapacity}
          onChange={(e) => handleChange("maxCapacity", e.target.value)}
          required
        />
      </div>

      <Input
        label="Schedule"
        id="schedule"
        placeholder="e.g. Mon/Wed 9:00 AM - 11:00 AM"
        value={form.schedule}
        onChange={(e) => handleChange("schedule", e.target.value)}
        required
      />

      <Select
        label="Teacher"
        id="teacherId"
        value={form.teacherId}
        onChange={(e) => handleChange("teacherId", e.target.value)}
        options={teacherOptions}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : course ? "Save changes" : "Add course"}
        </Button>
      </div>
    </form>
  );
}
