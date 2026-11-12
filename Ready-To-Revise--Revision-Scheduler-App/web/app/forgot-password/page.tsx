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

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-brand transition-colors";

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <header className="relative max-w-6xl w-full mx-auto pt-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center text-white text-sm font-bold">R</span>
          <span className="font-bold text-white">Ready-To-Revise</span>
        </a>
        <a href="/" className="text-sm text-white/75 hover:text-white transition-colors">Back to home</a>
      </header>

      <div className="relative flex-1 flex items-center justify-center py-12">
        <div className="animate-pop w-full max-w-md rounded-3xl border border-border bg-surface shadow-soft p-8">
          <h1 className="text-2xl font-bold text-center text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">
            Enter your email and we'll send you a reset code.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleForgot(); }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-brand px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-brand-dark active:bg-brand-deep disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send reset code"}
            </button>
          </form>
          <p className="mt-5 text-sm text-center text-muted">
            Remember your password? <a href="/login" className="text-brand font-medium hover:text-brand-dark">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
