import Link from "next/link";
import { ClickableRow } from "@/components/admin/ClickableRow";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDubai } from "@/lib/format";
import { formatAnswer } from "@/lib/survey";
import {
  ANSWER_FILTERS,
  CONTACT_OPTIONS,
  SURVEY_PAGE_SIZE,
  answersOf,
  applySurveyFilters,
  hasFilters,
  optionsFor,
  parsePage,
  parseSurveyFilters,
  toQuery,
  type SearchParams,
} from "@/lib/survey-queries";
import { deleteSurveyResponse } from "./actions";

export const dynamic = "force-dynamic";

export default async function SurveyListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = parseSurveyFilters(sp);
  const filtered = hasFilters(filters);

  const all = await db.surveyResponse.findMany({ orderBy: { createdAt: "desc" } });
  const matches = applySurveyFilters(all, filters);

  // Respondents who would "definitely" or "probably" consider DarShe (Q27), across all responses.
  const interested = all.filter((r) => {
    const v = answersOf(r).q27;
    return v === "Definitely would consider" || v === "Probably would consider";
  }).length;

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / SURVEY_PAGE_SIZE));
  const page = Math.min(parsePage(sp.page), pageCount);
  const rows = matches.slice((page - 1) * SURVEY_PAGE_SIZE, page * SURVEY_PAGE_SIZE);

  const from = total === 0 ? 0 : (page - 1) * SURVEY_PAGE_SIZE + 1;
  const to = Math.min(page * SURVEY_PAGE_SIZE, total);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl">Survey responses</h1>
          <span className="inline-flex rounded-full bg-terracotta px-3 py-1 text-sm font-semibold text-card">
            {all.length} total
          </span>
          <span className="inline-flex rounded-full bg-line px-3 py-1 text-sm font-semibold text-espresso">
            {interested} likely to consider DarShe
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/survey" target="_blank" rel="noopener" className="btn-outline !py-2.5 text-sm">
            Open survey form
          </Link>
          <a href={`/admin/survey/export${toQuery(filters)}`} className="btn-outline !py-2.5 text-sm">
            {filtered ? "Export filtered CSV" : "Export CSV"}
          </a>
        </div>
      </div>

      <form
        method="get"
        className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="First name, email or WhatsApp number"
            className="field-input"
          />
        </div>

        {ANSWER_FILTERS.map((f) => (
          <div key={f.param}>
            <label htmlFor={f.param} className="field-label">
              {f.label}
            </label>
            <select id={f.param} name={f.param} defaultValue={filters[f.param] ?? ""} className="field-input">
              <option value="">{f.all}</option>
              {optionsFor(f.qid).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div>
          <label htmlFor="contact" className="field-label">
            Contact
          </label>
          <select id="contact" name="contact" defaultValue={filters.contact ?? ""} className="field-input">
            <option value="">All</option>
            {CONTACT_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from" className="field-label">
            Received from
          </label>
          <input id="from" name="from" type="date" defaultValue={filters.from ?? ""} className="field-input" />
        </div>
        <div>
          <label htmlFor="to" className="field-label">
            Received to
          </label>
          <input id="to" name="to" type="date" defaultValue={filters.to ?? ""} className="field-input" />
        </div>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-2 lg:items-end lg:justify-end">
          <button type="submit" className="btn-primary !py-3">
            Apply filters
          </button>
          {filtered && (
            <Link href="/admin/survey" className="btn-outline !py-3">
              Clear
            </Link>
          )}
        </div>
      </form>

      {filtered && (
        <p role="status" className="mt-4 text-sm text-body-muted">
          {total} of {all.length} responses match these filters.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <caption className="sr-only">Survey responses, newest first</caption>
          <thead>
            <tr className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-body-muted">
              <th scope="col" className="px-4 py-3 font-semibold">Received (Dubai)</th>
              <th scope="col" className="px-4 py-3 font-semibold">First name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Age</th>
              <th scope="col" className="px-4 py-3 font-semibold">Employment</th>
              <th scope="col" className="px-4 py-3 font-semibold">Would consider DarShe</th>
              <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
              <th scope="col" className="px-4 py-3 font-semibold">Contact OK</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-body-muted">
                  {filtered ? "No responses match these filters." : "No survey responses yet."}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const a = answersOf(r);
                return (
                  <ClickableRow
                    key={r.id}
                    href={`/admin/survey/${r.id}`}
                    className="border-b border-line last:border-0 hover:bg-cream/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-body-muted">
                      <Link
                        href={`/admin/survey/${r.id}`}
                        className="font-medium text-espresso underline-offset-4 hover:text-terracotta-dark hover:underline"
                      >
                        {formatDubai(r.createdAt)}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">{r.firstName ?? <span className="text-body-muted">—</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">{formatAnswer(a.q1) || "—"}</td>
                    <td className="px-4 py-3.5">{formatAnswer(a.q2) || "—"}</td>
                    <td className="px-4 py-3.5">{formatAnswer(a.q27) || "—"}</td>
                    <td className="px-4 py-3.5">{r.email ?? r.whatsapp ?? <span className="text-body-muted">—</span>}</td>
                    <td className="px-4 py-3.5">
                      {r.contactConsent === null ? <span className="text-body-muted">—</span> : r.contactConsent ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3.5">
                      <DeleteButton
                        compact
                        action={deleteSurveyResponse.bind(null, r.id)}
                        itemLabel={`survey response received ${formatDubai(r.createdAt)}`}
                      />
                    </td>
                  </ClickableRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-body-muted">
        <p>{total === 0 ? "0 results" : `Showing ${from}–${to} of ${total}`}</p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={`/admin/survey${toQuery(filters, page - 1)}`} className="btn-outline !px-5 !py-2" rel="prev">
              Previous
            </Link>
          ) : (
            <span className="btn-outline !px-5 !py-2 opacity-40" aria-disabled="true">Previous</span>
          )}
          <span aria-current="page" className="px-2">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={`/admin/survey${toQuery(filters, page + 1)}`} className="btn-outline !px-5 !py-2" rel="next">
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
