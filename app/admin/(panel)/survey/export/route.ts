import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { csvCell, formatDubai } from "@/lib/format";
import { ALL_QUESTIONS, formatAnswer } from "@/lib/survey";
import { answersOf } from "@/lib/survey-queries";

export const dynamic = "force-dynamic";

/** One row per response, one column per question. Multi-select answers are joined with "; ". */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await db.surveyResponse.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "Response ID",
    "Received (Dubai time)",
    "Source",
    ...ALL_QUESTIONS.map((q) => `Q${q.n}. ${q.label}`),
  ];

  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    const a = answersOf(r);
    lines.push(
      [r.id, formatDubai(r.createdAt), r.source, ...ALL_QUESTIONS.map((q) => formatAnswer(a[q.id]))]
        .map(csvCell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="darshe-survey-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
