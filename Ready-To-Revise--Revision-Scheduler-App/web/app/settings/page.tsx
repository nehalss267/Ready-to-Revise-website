"use client";

import { useEffect, useState } from "react";
import {
  CircleAlert,
  Database,
  Download,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PasswordInput,
  Spinner,
} from "@/components/ui";
import { AppShell } from "@/components/app-shell";
import { apiGet, apiPostJson } from "@/lib/api";
import {
  isAuthed,
  listItems,
  listReviews,
} from "@/lib/local-store";
import { clearLocalData } from "@/lib/migrate";

interface Profile {
  userId: string;
  email: string;
}

export default function SettingsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localCounts, setLocalCounts] = useState({ items: 0, reviews: 0 });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const authedNow = isAuthed();
    setAuthed(authedNow);
    setName(localStorage.getItem("r2r_name"));
    setLocalCounts({ items: listItems().length, reviews: listReviews().length });

    if (authedNow) {
      apiGet<Profile>("/auth/profile")
        .then(setProfile)
        .catch(() => setProfile(null));
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await apiPostJson<{ message: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPwError(e.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: "ReadyToRevise web (guest data)",
      items: listItems(),
      reviews: listReviews(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ready-to-revise-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [confirmClear, setConfirmClear] = useState(false);

  if (authed === null) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Spinner className="size-6 text-brand-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {authed ? "Manage your account and data." : "Manage your guest data on this device."}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Account */}
          {authed && (
            <Section icon={UserRound} title="Account">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {name ?? "Account"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {profile?.email ?? "Loading…"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="size-3.5" />
                  Signed in
                </span>
              </div>
            </Section>
          )}
          {!authed && (
            <Section icon={UserRound} title="Account">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Guest</p>
                  <p className="text-xs text-slate-400">
                    Data stays in this browser until you create an account.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                  <CircleAlert className="size-3.5" />
                  Guest mode
                </span>
              </div>
            </Section>
          )}

          {/* Change password (authed) */}
          {authed && (
            <Section icon={KeyRound} title="Change password">
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                {pwError && <Alert variant="error">{pwError}</Alert>}
                {pwSuccess && (
                  <Alert variant="success">Password updated successfully.</Alert>
                )}

                <Field label="Current password">
                  <PasswordInput
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="New password" hint="At least 8 characters.">
                    <PasswordInput
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={pwSaving}>
                    Update password
                  </Button>
                </div>
              </form>
            </Section>
          )}

          {/* Data */}
          <Section icon={Database} title="Your data">
            {localCounts.items === 0 && localCounts.reviews === 0 ? (
              <p className="text-sm text-slate-500">
                Nothing stored on this device yet.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {localCounts.items} {localCounts.items === 1 ? "item" : "items"} and{" "}
                {localCounts.reviews} {localCounts.reviews === 1 ? "review" : "reviews"}{" "}
                stored in this browser.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportData} disabled={localCounts.items === 0 && localCounts.reviews === 0}>
                <Download className="size-4" />
                Export as JSON
              </Button>

              {localCounts.items > 0 && (
                confirmClear ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        clearLocalData();
                        setLocalCounts({ items: 0, reviews: 0 });
                        setConfirmClear(false);
                      }}
                    >
                      Yes, delete everything
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setConfirmClear(true)}>
                    <Trash2 className="size-4" />
                    Clear local data
                  </Button>
                )
              )}
            </div>

            {authed && localCounts.items > 0 && (
              <Alert variant="info" className="mt-4">
                These items haven&apos;t been imported yet — they&apos;ll be
                carried into your account on your next login.
              </Alert>
            )}
          </Section>

          {/* About */}
          <Section icon={ShieldCheck} title="About">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">App</dt>
                <dd className="font-medium text-slate-800">ReadyToRevise web · v1.0.0</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Website</dt>
                <dd className="font-medium text-slate-800">
                  <a
                    href="https://revision-scheduler-app.onrender.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:text-brand-700"
                  >
                    revision-scheduler-app.onrender.com
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Source</dt>
                <dd className="font-medium text-slate-800">
                  <a
                    href="https://github.com/nehalss267/Ready-To-Revise--Revision-Scheduler-App"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:text-brand-700"
                  >
                    GitHub repository
                  </a>
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </main>
    </AppShell>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4" />
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}
