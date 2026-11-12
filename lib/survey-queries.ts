import type { SurveyResponse } from "@prisma/client";
import type { Answers } from "@/lib/survey";

export const SURVEY_PAGE_SIZE = 20;

/** The stored JSON, narrowed to the shape we write. */
export function answersOf(row: Pick<SurveyResponse, "answers">): Answers {
  const raw = row.answers;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Answers) : {};
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
