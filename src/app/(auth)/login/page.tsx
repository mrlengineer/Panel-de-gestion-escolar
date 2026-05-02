"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* subtle background decorations */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-success/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent rounded-xl mb-4 shadow-lg shadow-accent/30">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">SchoolDesk</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8 shadow-xl shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="you@school.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-8 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted mb-3">
              Demo accounts{" "}
              <span className="text-text-primary font-medium">(password: admin123)</span>:
            </p>
            <div className="space-y-1.5">
              {[
                { role: "Admin", email: "admin@school.com" },
                { role: "Teacher", email: "teacher@school.com" },
                { role: "Finance", email: "finance@school.com" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setForm({ email: acc.email, password: "admin123" })}
                  className="w-full text-left px-3 py-2 rounded-lg bg-surface-2 hover:bg-border transition-colors text-xs text-text-muted"
                >
                  <span className="font-medium text-text-primary">{acc.role}</span> — {acc.email}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-6">
          SchoolDesk &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
