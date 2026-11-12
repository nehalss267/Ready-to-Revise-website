"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";
import { migrateLocalItemsToAccount } from "@/lib/migrate";
import {
  Alert,
  AuthShell,
  Button,
  Field,
  Input,
  PasswordInput,
} from "@/components/ui";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { accessToken } = await apiPostJson<{ accessToken: string }>("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("r2r_token", accessToken);
      localStorage.setItem("r2r_name", name.trim());
      // Carry guest items into the new account (best effort, non-blocking failures)
      await migrateLocalItemsToAccount().catch(() => null);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start revising smarter, not harder."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-5" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Full name">
          <Input
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

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

        <Field
          label="Password"
          hint="Use at least 8 characters."
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </Field>

        <Field
          label="Confirm password"
          error={
            confirmPassword && confirmPassword !== password
              ? "Passwords don't match"
              : undefined
          }
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
