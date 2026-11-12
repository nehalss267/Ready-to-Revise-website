"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";
import {
  Alert,
  AuthShell,
  Button,
  Field,
  Input,
  PasswordInput,
} from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await apiPostJson<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("r2r_token", accessToken);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to keep your revisions on track."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign up free
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-slate-500 transition-colors hover:text-brand-600"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
