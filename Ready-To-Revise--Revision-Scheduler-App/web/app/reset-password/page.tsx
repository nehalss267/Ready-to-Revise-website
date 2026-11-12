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

export default function ResetPasswordPage() {
  const router = useRouter();

  // Extract token from URL query string (client-side only)
  const search = typeof window !== "undefined" ? window.location.search : "";
  const urlParams = new URLSearchParams(search);
  const token = urlParams.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(token);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiPostJson<{ message: string }>("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      router.push("/login");
    } catch (e: any) {
      setError(e.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the reset code we emailed you, then choose a new password."
      footer={
        <>
          Didn&apos;t get a code?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Resend it
          </Link>
        </>
      }
    >
      <form onSubmit={handleReset} className="flex flex-col gap-5" noValidate>
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

        <Field label="Reset code" hint="The 6-digit code from your email.">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 482913"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="tracking-[0.3em] uppercase"
            required
          />
        </Field>

        <Field
          label="New password"
          hint="Use at least 8 characters."
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Create a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </Field>

        <Field
          label="Confirm new password"
          error={
            confirmPassword && confirmPassword !== newPassword
              ? "Passwords don't match"
              : undefined
          }
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
