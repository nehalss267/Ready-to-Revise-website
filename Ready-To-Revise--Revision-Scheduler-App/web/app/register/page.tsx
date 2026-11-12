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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <div className="max-w-md w-full bg-white dark:bg-surface rounded-3xl p-8 shadow-deep">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Create account</h2>
        <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2 text-lg font-medium text-white hover:bg-brand-dark active:bg-brand-deep shadow-sm transition-colors"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="text-sm text-center text-muted">
            Already have an account? <a href="/login" className="underline hover:underline-offset-2 font-medium">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}