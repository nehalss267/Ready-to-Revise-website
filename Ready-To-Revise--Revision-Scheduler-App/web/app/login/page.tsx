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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <div className="max-w-md w-full bg-white dark:bg-surface rounded-3xl p-8 shadow-deep">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Welcome back</h2>
        <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2 text-lg font-medium text-white hover:bg-brand-dark active:bg-brand-deep shadow-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-sm text-center text-muted">
            Don't have an account? <a href="/register" className="underline hover:underline-offset-2 font-medium">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}