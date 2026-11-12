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
} from "@/components/ui";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await apiPostJson<{ message: string }>("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      router.push("/reset-password");
    } catch (e: any) {
      setError(e.message || "Failed to send reset code.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset code."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Back to log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleForgot} className="flex flex-col gap-5" noValidate>
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

        <Button type="submit" size="lg" loading={sending} className="w-full">
          Send reset code
        </Button>
      </form>
    </AuthShell>
  );
}
