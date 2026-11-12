"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostJson } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
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
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message || "Registration failed. Please try again.");
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
          <h1 className="text-2xl font-bold text-center text-foreground">Create account</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">Free forever. Set up your first revision in minutes.</p>
          <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground">Full name</label>
              <input
                id="name"
                placeholder="Ada Lovelace"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
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
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-foreground">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
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
              {loading ? "Creating…" : "Create account"}
            </button>
            <p className="text-sm text-center text-muted">
              Already have an account? <a href="/login" className="text-brand font-medium hover:text-brand-dark">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
