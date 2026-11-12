import { EnquiryStatus, type Prisma } from "@prisma/client";
import { isPostgres } from "@/lib/db";
import { OCCUPATIONS } from "@/lib/enquiry-schema";

export const PAGE_SIZE = 20;

export const STATUSES = Object.values(EnquiryStatus) as EnquiryStatus[];

export type SearchParams = Record<string, string | string[] | undefined>;

export type Filters = {
  q: string;
  status?: EnquiryStatus;
  occupation?: string;
};

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export function parseFilters(sp: SearchParams): Filters {
  const status = first(sp.status);
  const occupation = first(sp.occupation);
  return {
    q: first(sp.q).trim().slice(0, 100),
    status: (STATUSES as string[]).includes(status) ? (status as EnquiryStatus) : undefined,
    occupation: (OCCUPATIONS as readonly string[]).includes(occupation) ? occupation : undefined,
  };
}

export function parsePage(sp: SearchParams): number {
  const n = Number.parseInt(first(sp.page), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function buildWhere({ q, status, occupation }: Filters): Prisma.EnquiryWhereInput {
  // SQLite's LIKE is already case-insensitive for ASCII; PostgreSQL needs `mode`.
  const ci = (isPostgres ? { mode: "insensitive" } : {}) as object;
  return {
    ...(status ? { status } : {}),
    ...(occupation ? { occupation } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, ...ci } },
            { email: { contains: q, ...ci } },
            { phone: { contains: q, ...ci } },
          ],
        }
      : {}),
  };
}

/** Query string for the current filters (optionally with a page), for links. */
export function toQuery(filters: Filters, page?: number): string {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.status) p.set("status", filters.status);
  if (filters.occupation) p.set("occupation", filters.occupation);
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
