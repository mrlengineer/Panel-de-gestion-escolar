"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Student } from "@/types";

interface Props {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    address: student?.address ?? "",
    status: student?.status ?? "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = student ? `/api/students/${student.id}` : "/api/students";
    const method = student ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data?.error?.formErrors?.[0] ?? "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          id="firstName"
          value={form.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          required
        />
        <Input
          label="Last name"
          id="lastName"
          value={form.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          required
        />
      </div>

      <Input
        label="Email"
        id="email"
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />

      <Input
        label="Phone"
        id="phone"
        value={form.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      <Input
        label="Address"
        id="address"
        value={form.address}
        onChange={(e) => handleChange("address", e.target.value)}
      />

      <Select
        label="Status"
        id="status"
        value={form.status}
        onChange={(e) => handleChange("status", e.target.value)}
        options={[
          { label: "Active", value: "ACTIVE" },
          { label: "Inactive", value: "INACTIVE" },
        ]}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : student ? "Save changes" : "Add student"}
        </Button>
      </div>
    </form>
  );
}
