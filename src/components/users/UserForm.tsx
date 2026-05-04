"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "FINANCE";
  createdAt: string;
};

interface Props {
  user?: PublicUser | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "TEACHER",
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

    const url = user ? `/api/users/${user.id}` : "/api/users";
    const method = user ? "PATCH" : "POST";

    const body: Record<string, string> = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password) body.password = form.password;
    if (!user) body.password = form.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      if (typeof data?.error === "string") {
        setError(data.error);
      } else {
        const formErrors = data?.error?.formErrors ?? [];
        const fieldErrors = Object.values(data?.error?.fieldErrors ?? {}).flat();
        setError((formErrors[0] ?? fieldErrors[0] ?? "Something went wrong.") as string);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        id="name"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
        required
      />

      <Input
        label="Email"
        id="email"
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />

      <Input
        label={user ? "New password (leave blank to keep current)" : "Password"}
        id="password"
        type="password"
        value={form.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required={!user}
      />

      <Select
        label="Role"
        id="role"
        value={form.role}
        onChange={(e) => handleChange("role", e.target.value)}
        options={[
          { label: "Admin", value: "ADMIN" },
          { label: "Teacher", value: "TEACHER" },
          { label: "Finance", value: "FINANCE" },
        ]}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : user ? "Save changes" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
