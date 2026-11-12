import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDubai } from "@/lib/format";
import { formatAnswer } from "@/lib/survey";
import { SURVEY_PAGE_SIZE, answersOf, parsePage } from "@/lib/survey-queries";

export const dynamic = "force-dynamic";

export default async function SurveyListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const [total, interested] = await Promise.all([
    db.surveyResponse.count(),
    // Respondents who would "definitely" or "probably" consider DarShe (Q27).
    db.surveyResponse.findMany({ select: { answers: true } }).then(
      (rows) =>
        rows.filter((r) => {
          const v = answersOf(r).q27;
          return v === "Definitely would consider" || v === "Probably would consider";
        }).length,
    ),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / SURVEY_PAGE_SIZE));
  const page = Math.min(parsePage(sp.page), pageCount);

  const rows = await db.surveyResponse.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * SURVEY_PAGE_SIZE,
    take: SURVEY_PAGE_SIZE,
  });

  const from = total === 0 ? 0 : (page - 1) * SURVEY_PAGE_SIZE + 1;
  const to = Math.min(page * SURVEY_PAGE_SIZE, total);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl">Survey responses</h1>
          <span className="inline-flex rounded-full bg-terracotta px-3 py-1 text-sm font-semibold text-card">
            {total} total
          </span>
          <span className="inline-flex rounded-full bg-line px-3 py-1 text-sm font-semibold text-espresso">
            {interested} likely to consider DarShe
          </span>
        </div>
        <a href="/admin/survey/export" className="btn-outline !py-2.5 text-sm">
          Export CSV
        </a>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-body-muted">
                  No survey responses yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const a = answersOf(r);
                return (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-cream/40">
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
                  </tr>
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
            <Link href={`/admin/survey?page=${page - 1}`} className="btn-outline !px-5 !py-2" rel="prev">
              Previous
            </Link>
          ) : (
            <span className="btn-outline !px-5 !py-2 opacity-40" aria-disabled="true">Previous</span>
          )}
          <span aria-current="page" className="px-2">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={`/admin/survey?page=${page + 1}`} className="btn-outline !px-5 !py-2" rel="next">
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
