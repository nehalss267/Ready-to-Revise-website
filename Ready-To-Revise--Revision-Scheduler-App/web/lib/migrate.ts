import { apiPostJson } from "./api";
import { listItems } from "./local-store";
import type { StudyItem } from "./types";

export interface MigrationResult {
  migrated: number;
  failed: number;
}

export async function migrateLocalItemsToAccount(): Promise<MigrationResult | null> {
  const items = listItems();
  if (items.length === 0) return null;

  let migrated = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await apiPostJson<unknown>("/study-items", toCreateDto(item));
      migrated++;
    } catch {
      failed++;
    }
  }

  if (failed === 0) {
    clearLocalData();
  }

  return { migrated, failed };
}

export function clearLocalData(): void {
  localStorage.removeItem("r2r_items_v1");
  localStorage.removeItem("r2r_reviews_v1");
}

function toCreateDto(item: StudyItem) {
  const isMcq = item.type === "QUESTION" && !!item.options && item.correctAnswerIndex !== undefined;

  return {
    title: item.title,
    content: item.content,
    type: item.type,
    options: isMcq ? item.options : undefined,
    correctAnswerIndex: isMcq ? item.correctAnswerIndex : undefined,
  };
}
