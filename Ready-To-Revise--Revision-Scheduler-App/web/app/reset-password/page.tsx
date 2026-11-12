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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <div className="max-w-md w-full bg-white dark:bg-surface rounded-3xl p-8 shadow-deep">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Reset password</h2>
        <form onSubmit={e => { e.preventDefault(); handleReset(); }} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">OTP (6-digit code)</label>
            <input
              type="number"
              placeholder="OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">New password</label>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Confirm new password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2 text-lg font-medium text-white hover:bg-brand-dark active:bg-brand-deep shadow-sm transition-colors"
          >
            {loading ? "Updating…" : "Reset password"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-muted">
          Don't have a reset code? <a href="/forgot-password" className="underline hover:underline-offset-2 font-medium">Request a new one</a>
        </p>
      </div>
    </div>
  );
}