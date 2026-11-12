"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  Flame,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
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
import { apiGet } from "@/lib/api";
import { getLocalAnalytics, getLocalHeatmap } from "@/lib/analytics";
import { isAuthed } from "@/lib/local-store";
import type {
  AnalyticsHeatmap,
  AnalyticsOverview,
} from "@/lib/analytics";

type Range = "7d" | "30d";

const HEATMAP_LEVEL_STYLES = [
  "bg-slate-100",
  "bg-brand-200",
  "bg-brand-400",
  "bg-brand-600",
  "bg-brand-800",
];

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>("7d");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [heatmap, setHeatmap] = useState<AnalyticsHeatmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authedNow = isAuthed();
    setAuthed(authedNow);
    setHeatmap(authedNow ? null : getLocalHeatmap());
    if (authedNow) {
      apiGet<AnalyticsHeatmap>("/analytics/heatmap")
        .then(setHeatmap)
        .catch(() => setHeatmap(null));
    }
  }, []);

  useEffect(() => {
    if (authed === null) return;
    setError(null);

    if (!authed) {
      setOverview(getLocalAnalytics(range));
      return;
    }

    setOverview(null);
    apiGet<AnalyticsOverview>(`/analytics/overview?range=${range}`)
      .then(setOverview)
      .catch((e: any) => setError(e.message || "Failed to load analytics."));
  }, [authed, range]);

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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {authed
                ? "Your study activity, accuracy and streaks."
                : "Guest stats from this device — sign in to see your full history."}
            </p>
          </div>

          {!authed && (
            <ButtonLink href="/register" size="sm" variant="outline">
              Create account
            </ButtonLink>
          )}
        </div>

        {/* Range toggle */}
        <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(["7d", "30d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                range === r
                  ? "bg-brand-600 text-white shadow-soft"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {r === "7d" ? "Last 7 days" : "Last 30 days"}
            </button>
          ))}
        </div>

        {error && (
          <Alert variant="error" className="mt-6">
            {error}
          </Alert>
        )}

        {!overview ? (
          <div className="flex justify-center py-24">
            <Spinner className="size-6 text-brand-600" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <SummaryCard
                icon={ListChecks}
                label="Reviews"
                value={overview.summary.totalReviews}
              />
              <SummaryCard
                icon={Target}
                label="Accuracy"
                value={`${overview.summary.accuracyPct}%`}
              />
              <SummaryCard
                icon={Flame}
                label="Current streak"
                value={`${overview.summary.currentStreak}d`}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Longest streak"
                value={`${overview.summary.longestStreak}d`}
              />
              <SummaryCard
                icon={Gauge}
                label="Today's completion"
                value={`${overview.summary.completionToday}%`}
                className="col-span-2 lg:col-span-1"
              />
            </div>

            {/* Daily chart */}
            <Card className="mt-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Reviews per day
                </h2>
                <span className="text-xs text-slate-400">
                  bar height = reviews · % = accuracy
                </span>
              </div>
              <DailyChart daily={overview.daily} />
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Subjects */}
              <Card className="lg:col-span-2">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    {authed ? "By subject" : "By item type"}
                  </h2>
                </div>
                {overview.subjects.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No items yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-5 py-2.5 font-medium">Name</th>
                          <th className="px-3 py-2.5 text-right font-medium">Items</th>
                          <th className="px-3 py-2.5 text-right font-medium">Due</th>
                          <th className="px-3 py-2.5 text-right font-medium">Reviews</th>
                          <th className="px-5 py-2.5 text-right font-medium">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.subjects.map((s) => (
                          <tr key={s.name}>
                            <td className="px-5 py-3 font-medium text-slate-800">
                              {s.name}
                            </td>
                            <td className="px-3 py-3 text-right text-slate-600">{s.items}</td>
                            <td className="px-3 py-3 text-right text-slate-600">
                              <span className={s.due > 0 ? "font-medium text-brand-600" : ""}>
                                {s.due}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right text-slate-600">{s.reviews}</td>
                            <td className="px-5 py-3 text-right">
                              <AccuracyBadge pct={s.accuracyPct} hasData={s.reviews > 0} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Recent */}
              <Card>
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">Recent reviews</h2>
                </div>
                {overview.recent.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No reviews yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {overview.recent.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {r.isCorrect === true ? (
                            <CircleCheck className="size-4 shrink-0 text-emerald-500" />
                          ) : r.isCorrect === false ? (
                            <CircleAlert className="size-4 shrink-0 text-red-400" />
                          ) : (
                            <span className="size-4 shrink-0 rounded-full border border-slate-200" />
                          )}
                          <span className="truncate text-sm text-slate-700">
                            {r.title}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">
                          {new Date(r.reviewedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-slate-100 px-5 py-4">
                  <Link
                    href="/review"
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Start a session →
                  </Link>
                </div>
              </Card>
            </div>

            {/* Heatmap */}
            <Card className="mt-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Activity heatmap</h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  Less
                  {HEATMAP_LEVEL_STYLES.map((s) => (
                    <span key={s} className={cn("size-3 rounded-sm", s)} />
                  ))}
                  More
                </div>
              </div>
              {heatmap ? (
                <Heatmap data={heatmap} />
              ) : (
                <div className="flex justify-center py-10">
                  <Spinner className="size-5 text-slate-400" />
                </div>
              )}
              {!authed && heatmap && heatmap.days.every((d) => d.completed === 0) && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  Complete a revision session to light up your heatmap.
                </p>
              )}
            </Card>
          </>
        )}
      </main>
    </AppShell>
  );
}

/* --------------------------------- Widgets -------------------------------- */

function SummaryCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function DailyChart({ daily }: { daily: AnalyticsOverview["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.completed));

  return (
    <div className="mt-5">
      <div className="flex h-40 items-end gap-1">
        {daily.map((d) => {
          const h = (d.completed / max) * 100;
          return (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end"
              title={`${d.date}: ${d.completed} reviews · ${d.accuracyPct}% accuracy`}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  d.completed === 0
                    ? "bg-slate-100"
                    : "bg-brand-500 group-hover:bg-brand-600",
                )}
                style={{ height: `${Math.max(h, d.completed === 0 ? 3 : 8)}%` }}
              />
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                {d.completed} · {d.accuracyPct}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1">
        {daily.map((d, i) => (
          <div key={d.date} className="flex-1 text-center text-[10px] text-slate-400">
            {i % Math.ceil(daily.length / 7) === 0
              ? new Date(`${d.date}T00:00:00Z`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ data }: { data: AnalyticsHeatmap }) {
  const days = data.days;
  if (days.length === 0) return null;

  // Pad the first week so columns align with days of week (Sun–Sat)
  const startDow = new Date(`${data.startDate}T00:00:00Z`).getUTCDay();
  const padded: Array<typeof days[number] | null> = [
    ...Array.from({ length: startDow }, () => null),
    ...days,
  ];

  const weeks: Array<Array<typeof days[number] | null>> = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="mt-5 overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <span
                key={di}
                className={cn(
                  "size-3 rounded-sm",
                  day ? HEATMAP_LEVEL_STYLES[day.level] : "bg-transparent",
                )}
                title={
                  day
                    ? `${day.date}: ${day.completed} ${day.completed === 1 ? "review" : "reviews"}`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccuracyBadge({ pct, hasData }: { pct: number; hasData: boolean }) {
  if (!hasData) {
    return <span className="text-slate-400">—</span>;
  }
  const tone =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 60
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-600";

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}>
      {pct}%
    </span>
  );
}
