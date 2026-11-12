"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { accessToken } = await apiPostJson<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("r2r_token", accessToken);
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message || "Login failed. Please check your credentials.");
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
          <h1 className="text-2xl font-bold text-center text-foreground">Welcome back</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">Log in to continue your revision streak.</p>
          <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="space-y-4">
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
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="flex justify-end">
              <a href="/forgot-password" className="text-sm text-brand hover:text-brand-dark font-medium">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-brand-dark active:bg-brand-deep disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-sm text-center text-muted">
              Don't have an account? <a href="/register" className="text-brand font-medium hover:text-brand-dark">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
