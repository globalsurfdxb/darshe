import type { SurveyResponse } from "@prisma/client";
import { ALL_QUESTIONS, type Answers } from "@/lib/survey";

export const SURVEY_PAGE_SIZE = 20;

export type SearchParams = Record<string, string | string[] | undefined>;

/** The stored JSON, narrowed to the shape we write. */
export function answersOf(row: Pick<SurveyResponse, "answers">): Answers {
  const raw = row.answers;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Answers) : {};
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number.parseInt(first(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Filters that match one survey answer exactly. `param` is the URL query key. */
export const ANSWER_FILTERS = [
  { param: "age", qid: "q1", label: "Age group", all: "All ages" },
  { param: "employment", qid: "q2", label: "Employment", all: "All" },
  { param: "interest", qid: "q27", label: "Would consider DarShe", all: "All" },
] as const;

export type AnswerFilterParam = (typeof ANSWER_FILTERS)[number]["param"];

export const CONTACT_OPTIONS = [
  "Agreed to be contacted",
  "Declined to be contacted",
  "No contact details",
] as const;

export interface SurveyFilters {
  q: string;
  age?: string;
  employment?: string;
  interest?: string;
  contact?: string;
  /** YYYY-MM-DD, Dubai calendar day, inclusive */
  from?: string;
  to?: string;
}

export function optionsFor(qid: string): readonly string[] {
  return ALL_QUESTIONS.find((q) => q.id === qid)?.options ?? [];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Reads filters from the URL; values that aren't valid options are ignored. */
export function parseSurveyFilters(sp: SearchParams): SurveyFilters {
  const filters: SurveyFilters = { q: first(sp.q).trim().slice(0, 100) };

  for (const f of ANSWER_FILTERS) {
    const v = first(sp[f.param]);
    if (optionsFor(f.qid).includes(v)) filters[f.param] = v;
  }

  const contact = first(sp.contact);
  if ((CONTACT_OPTIONS as readonly string[]).includes(contact)) filters.contact = contact;

  const from = first(sp.from);
  const to = first(sp.to);
  if (DATE_RE.test(from)) filters.from = from;
  if (DATE_RE.test(to)) filters.to = to;

  return filters;
}

export function hasFilters(f: SurveyFilters): boolean {
  return Boolean(f.q || f.age || f.employment || f.interest || f.contact || f.from || f.to);
}

/** Dubai is UTC+4 all year (no daylight saving), so day boundaries are fixed offsets. */
function dubaiStart(day: string): number {
  return new Date(`${day}T00:00:00+04:00`).getTime();
}
function dubaiEnd(day: string): number {
  return new Date(`${day}T23:59:59.999+04:00`).getTime();
}

/**
 * Answers live in a JSON column, and JSON querying differs between SQLite and
 * PostgreSQL, so filtering is done in memory. That is fine at survey scale
 * (hundreds to a few thousand responses).
 */
export function applySurveyFilters(rows: SurveyResponse[], f: SurveyFilters): SurveyResponse[] {
  const needle = f.q.toLowerCase();
  const from = f.from ? dubaiStart(f.from) : null;
  const to = f.to ? dubaiEnd(f.to) : null;

  return rows.filter((r) => {
    const a = answersOf(r);

    if (needle) {
      const hay = [r.firstName, r.email, r.whatsapp].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(needle)) return false;
    }

    for (const af of ANSWER_FILTERS) {
      const wanted = f[af.param];
      if (wanted && a[af.qid] !== wanted) return false;
    }

    if (f.contact === "Agreed to be contacted" && r.contactConsent !== true) return false;
    if (f.contact === "Declined to be contacted" && r.contactConsent !== false) return false;
    if (f.contact === "No contact details" && (r.email || r.whatsapp)) return false;

    const t = r.createdAt.getTime();
    if (from !== null && t < from) return false;
    if (to !== null && t > to) return false;

    return true;
  });
}

/** Query string for the current filters (and optional page), for links. */
export function toQuery(f: SurveyFilters, page?: number): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  for (const af of ANSWER_FILTERS) {
    const v = f[af.param];
    if (v) p.set(af.param, v);
  }
  if (f.contact) p.set("contact", f.contact);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
