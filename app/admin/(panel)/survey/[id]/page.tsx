import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDubai, whatsappUrl } from "@/lib/format";
import { SURVEY_SECTIONS, formatAnswer } from "@/lib/survey";
import { answersOf } from "@/lib/survey-queries";

export const dynamic = "force-dynamic";

export default async function SurveyResponsePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const response = await db.surveyResponse.findUnique({ where: { id } });
  if (!response) notFound();

  const answers = answersOf(response);
  const wa = response.whatsapp ? whatsappUrl(response.whatsapp) : null;
  const link = "font-medium text-terracotta-dark underline underline-offset-4 hover:no-underline";

  return (
    <>
      <Link href="/admin/survey" className="text-sm font-medium text-body-muted hover:text-terracotta-dark">
        ← All responses
      </Link>

      <h1 className="mt-4 text-3xl sm:text-4xl">Survey response</h1>
      <p className="mt-2 text-body-muted">
        Received {formatDubai(response.createdAt)} (Dubai time)
        {response.source ? ` · source: ${response.source}` : ""}
      </p>

      <div className="mt-8 space-y-6">
        {SURVEY_SECTIONS.map((section) => (
          <section key={section.id} className="rounded-2xl border border-line bg-card px-6 py-2">
            <h2 className="border-b border-line py-4 text-2xl">{section.title}</h2>
            <dl>
              {section.questions.map((q) => {
                const value = answers[q.id];
                const text = formatAnswer(value);
                return (
                  <div key={q.id} className="grid gap-1 border-b border-line py-4 last:border-0 sm:grid-cols-[1fr_1fr] sm:gap-8">
                    <dt className="text-sm text-body-muted">
                      <span className="mr-1.5 font-medium text-terracotta-dark">{q.n}.</span>
                      {q.label}
                    </dt>
                    <dd className="text-ink">
                      {!text ? (
                        <span className="text-body-muted">Not answered</span>
                      ) : q.id === "q32" ? (
                        <a href={`mailto:${text}`} className={link}>
                          {text}
                        </a>
                      ) : q.id === "q33" && wa ? (
                        <>
                          <span className="mr-3">{text}</span>
                          <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
                            Open in WhatsApp
                          </a>
                        </>
                      ) : Array.isArray(value) ? (
                        <ul className="list-disc space-y-0.5 pl-5">
                          {value.map((v) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      ) : (
                        text
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </>
  );
}
