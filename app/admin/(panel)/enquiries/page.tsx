import Link from "next/link";
import { StatusBadge, statusLabels } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  PAGE_SIZE,
  STATUSES,
  buildWhere,
  parseFilters,
  parsePage,
  toQuery,
  type SearchParams,
} from "@/lib/enquiry-queries";
import { OCCUPATIONS } from "@/lib/enquiry-schema";
import { formatDate, formatDubai } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const filters = parseFilters(sp);
  const where = buildWhere(filters);

  const [total, newCount] = await Promise.all([
    db.enquiry.count({ where }),
    db.enquiry.count({ where: { status: "NEW" } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(sp), pageCount);

  const rows = await db.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const hasFilters = Boolean(filters.q || filters.status || filters.occupation);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl">Enquiries</h1>
          <span
            className="inline-flex items-center rounded-full bg-terracotta px-3 py-1 text-sm font-semibold text-card"
            aria-label={`${newCount} new enquiries`}
          >
            {newCount} new
          </span>
        </div>
        <a
          href={`/admin/enquiries/export${toQuery(filters)}`}
          className="btn-outline !py-2.5 text-sm"
        >
          Export CSV
        </a>
      </div>

      <form method="get" className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Name, email or phone"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={filters.status ?? ""} className="field-input">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="occupation" className="field-label">
            Occupation
          </label>
          <select
            id="occupation"
            name="occupation"
            defaultValue={filters.occupation ?? ""}
            className="field-input"
          >
            <option value="">All occupations</option>
            {OCCUPATIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary !py-3">
            Apply
          </button>
          {hasFilters && (
            <Link href="/admin/enquiries" className="btn-outline !py-3">
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <caption className="sr-only">Enquiries, newest first</caption>
          <thead>
            <tr className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-body-muted">
              <th scope="col" className="px-4 py-3 font-semibold">Received (Dubai)</th>
              <th scope="col" className="px-4 py-3 font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Occupation</th>
              <th scope="col" className="px-4 py-3 font-semibold">Room preference</th>
              <th scope="col" className="px-4 py-3 font-semibold">Move-in</th>
              <th scope="col" className="px-4 py-3 font-semibold">Length of stay</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-body-muted">
                  {hasFilters ? "No enquiries match these filters." : "No enquiries yet."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-cream/40">
                  <td className="whitespace-nowrap px-4 py-3.5 text-body-muted">{formatDubai(r.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/enquiries/${r.id}`}
                      className="font-medium text-espresso underline-offset-4 hover:text-terracotta-dark hover:underline"
                    >
                      {r.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">{r.occupation}</td>
                  <td className="px-4 py-3.5">{r.roomPreference}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">{formatDate(r.moveInDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">{r.lengthOfStay}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-body-muted">
        <p>
          {total === 0 ? "0 results" : `Showing ${from}–${to} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={`/admin/enquiries${toQuery(filters, page - 1)}`} className="btn-outline !px-5 !py-2" rel="prev">
              Previous
            </Link>
          ) : (
            <span className="btn-outline !px-5 !py-2 opacity-40" aria-disabled="true">Previous</span>
          )}
          <span aria-current="page" className="px-2">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={`/admin/enquiries${toQuery(filters, page + 1)}`} className="btn-outline !px-5 !py-2" rel="next">
              Next
            </Link>
          ) : (
            <span className="btn-outline !px-5 !py-2 opacity-40" aria-disabled="true">Next</span>
          )}
        </div>
      </nav>
    </>
  );
}
