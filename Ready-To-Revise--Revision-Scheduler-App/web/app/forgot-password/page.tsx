"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleForgot = async () => {
    setSending(true);
    try {
      await apiPostJson<{ message: string }>("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      alert("If an account with that email exists, a reset code has been sent.");
      router.push("/login");
    } catch (e: any) {
      alert(e.message || "Failed to send reset code.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <div className="max-w-md w-full bg-white dark:bg-surface rounded-3xl p-8 shadow-deep">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Forgot password?</h2>
        <form onSubmit={e => { e.preventDefault(); handleForgot(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email address</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-md bg-brand px-4 py-2 text-lg font-medium text-white hover:bg-brand-dark active:bg-brand-deep shadow-sm transition-colors"
          >
            {sending ? "Sending…" : "Send reset code"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-muted">
          Remember your password? <a href="/login" className="underline hover:underline-offset-2 font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}