"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  // Extract token from URL query string (client-side only)
  const search = typeof window !== "undefined" ? window.location.search : "";
  const urlParams = new URLSearchParams(search);
  const token = urlParams.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiPostJson<{ message: string }>("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      alert("Password updated successfully. You can now log in.");
      router.push("/login");
    } catch (e: any) {
      alert(e.message || "Failed to reset password.");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-center text-foreground">Reset password</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">
            Enter the 6-digit code we emailed you and choose a new password.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleReset(); }} className="space-y-4">
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
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-1.5 text-foreground">Reset code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoComplete="one-time-code"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                className={`${inputClass} tracking-[0.4em] font-mono text-center`}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1.5 text-foreground">New password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-foreground">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-brand-dark active:bg-brand-deep disabled:opacity-60"
            >
              {loading ? "Updating…" : "Reset password"}
            </button>
          </form>
          <p className="mt-5 text-sm text-center text-muted">
            Don't have a reset code? <a href="/forgot-password" className="text-brand font-medium hover:text-brand-dark">Request a new one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
