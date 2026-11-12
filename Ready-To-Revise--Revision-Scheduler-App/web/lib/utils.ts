// @ts-nocheck
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays === 0 && diffHours < 24) {
    const h = diffHours || 1;
    return `${h}h ago`;
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDueDate(dueAt: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueAt);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() === today.getTime()) {
    return "Due today";
  }
  if (due.getTime() === today.setDate(today.getDate() + 1).getTime()) {
    return "Due tomorrow";
  }
  return formatRelativeDate(dueAt);
}

export function parseRange(range?: string): "7d" | "30d" {
  return range === "30d" ? "30d" : "7d";
}

export function dueBeforeISO(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function rangeDays(range: "7d" | "30d"): number {
  return range === "30d" ? 30 : 7;
}

export function uuidv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${hex()}${hex()}-${hex()}-4${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function rangeDays2(range: "7d" | "30d"): number {
  return range === "30d" ? 30 : 7;
}