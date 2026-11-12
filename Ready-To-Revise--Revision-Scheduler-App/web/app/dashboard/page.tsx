"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChartColumn,
  CircleCheck,
  Flame,
  Layers,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Spinner,
  cn,
} from "@/components/ui";
import { AppShell } from "@/components/app-shell";
import { ItemForm } from "@/components/item-form";
import { apiGet } from "@/lib/api";
import {
  deleteItem,
  formatDue,
  getDashboardStats,
  hasLocalData,
  isAuthed,
  listItems,
} from "@/lib/local-store";
import type { DashboardStats, StudyItem } from "@/lib/types";

interface AuthedDashboard {
  user: { name: string };
  stats: { studyItems: number; inboxItems: number };
  reviews: {
    dueToday: number;
    upcoming: number;
    completedToday: number;
    slippingSoon: number;
  };
  progress: { completionPercentage: number; streakDays: number };
  ai: { suggestion: string | null };
}

export default function DashboardPage() {
  const [mode, setMode] = useState<"loading" | "guest" | "authed">("loading");
  const [authedData, setAuthedData] = useState<AuthedDashboard | null>(null);
  const [authedError, setAuthedError] = useState<string | null>(null);
  const [guestStats, setGuestStats] = useState<DashboardStats | null>(null);
  const [guestItems, setGuestItems] = useState<StudyItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const refreshGuest = useCallback(() => {
    setGuestStats(getDashboardStats());
    setGuestItems(listItems());
  }, []);

  useEffect(() => {
    if (!isAuthed()) {
      setMode("guest");
      refreshGuest();
      return;
    }

    apiGet<AuthedDashboard>("/dashboard")
      .then((data) => {
        setAuthedData(data);
        setMode("authed");
      })
      .catch((e: Error) => {
        setAuthedError(e.message || "Failed to load dashboard.");
        setMode("authed");
      });
  }, [refreshGuest]);

  const stats = mode === "authed" && authedData ? authedData : guestStats;
  if (mode === "loading" || !stats) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Spinner className="size-6 text-brand-600" />
        </div>
      </AppShell>
    );
  }

  const isAuthedMode = mode === "authed" && !!authedData;
  const name = isAuthedMode ? authedData.user.name : "there";
  const dueToday = "reviews" in stats ? stats.reviews.dueToday : stats.dueToday;
  const upcoming = "reviews" in stats ? stats.reviews.upcoming : stats.upcoming;
  const completedToday =
    "reviews" in stats ? stats.reviews.completedToday : stats.completedToday;
  const streakDays =
    "progress" in stats ? stats.progress.streakDays : stats.streakDays;
  const totalItems =
    "stats" in stats ? stats.stats.studyItems : stats.totalItems;

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Guest banner */}
        {!isAuthedMode && (
          <Alert variant="info" className="mb-6">
            You&apos;re using guest mode — everything is stored on this device
            only.{" "}
            <Link href="/register" className="font-medium underline underline-offset-2">
              Create a free account
            </Link>{" "}
            to sync and back up your items.
          </Alert>
        )}

        {isAuthedMode && authedError && (
          <Alert variant="error" className="mb-6">
            {authedError}
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back, {name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {dueToday > 0
                ? `${dueToday} ${dueToday === 1 ? "item is" : "items are"} due for revision today.`
                : "Nothing due today — you're all caught up."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showForm ? "outline" : "secondary"}
              onClick={() => setShowForm((v) => !v)}
              disabled={isAuthedMode}
              title={isAuthedMode ? "Adding items requires uploading documents (coming to web)" : undefined}
            >
              <Plus className="size-4" />
              Add item
            </Button>
            <ButtonLink href="/review">
              <Play className="size-4" />
              Start revision
            </ButtonLink>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={CalendarClock}
            label="Due today"
            value={dueToday}
            tone={dueToday > 0 ? "brand" : "default"}
          />
          <StatCard icon={Layers} label="Upcoming" value={upcoming} />
          <StatCard
            icon={CircleCheck}
            label="Completed today"
            value={completedToday}
            tone={completedToday > 0 ? "emerald" : "default"}
          />
          <StatCard icon={Flame} label="Streak" value={`${streakDays}d`} />
        </div>

        {/* AI suggestion (authed) */}
        {isAuthedMode && authedData?.ai?.suggestion && (
          <Card className="mt-6 flex items-start gap-3 border-brand-200 bg-brand-50/60 p-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-brand-900">Suggestion</p>
              <p className="mt-0.5 text-sm text-brand-800">{authedData.ai.suggestion}</p>
            </div>
          </Card>
        )}

        {/* Add item form (guest) */}
        {!isAuthedMode && showForm && (
          <div className="mt-6">
            <ItemForm
              onCreated={() => {
                refreshGuest();
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Content grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Items list */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                {isAuthedMode ? "Your library" : "Your items"}
              </h2>
              <span className="text-xs text-slate-400">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            {!isAuthedMode && guestItems.length === 0 ? (
              <EmptyState onAdd={() => setShowForm(true)} />
            ) : !isAuthedMode ? (
              <ul className="divide-y divide-slate-100">
                {guestItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item.title || item.content || "Untitled"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.type} · {formatDue(item.nextReviewAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        deleteItem(item.id);
                        refreshGuest();
                      }}
                      aria-label={`Delete ${item.title}`}
                      className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-500">
                  Your questions live in uploaded documents. Browse and revise
                  them from the recommendation queue.
                </p>
              </div>
            )}
          </Card>

          {/* Activity */}
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Recent activity</h2>
            </div>
            {"recentActivity" in stats && stats.recentActivity.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {stats.recentActivity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="truncate text-sm text-slate-700">{a.title}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDue(a.reviewedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No reviews yet. Your history will show up here.
              </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ChartColumn className="size-3.5" />
                Analytics deep-dive coming soon
              </div>
            </div>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string | number;
  tone?: "default" | "brand" | "emerald";
}) {
  const tones = {
    default: "bg-slate-100 text-slate-600",
    brand: "bg-brand-100 text-brand-700",
    emerald: "bg-emerald-100 text-emerald-700",
  } as const;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Layers className="size-6" />
      </span>
      <h3 className="font-semibold text-slate-900">No items yet</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Add your first question or note to start building a revision schedule.
      </p>
      <Button className="mt-5" onClick={onAdd}>
        <Plus className="size-4" />
        Add your first item
      </Button>
    </div>
  );
}
