import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { buildWhere, parseFilters } from "@/lib/enquiry-queries";
import { csvCell, formatDate, formatDubai } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters = parseFilters(params);

  const rows = await db.enquiry.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Received (Dubai time)",
    "Name",
    "Occupation",
    "Email",
    "Phone",
    "Room preference",
    "Move-in date",
    "Length of stay",
    "Status",
    "Source",
    "Message",
  ];

  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        formatDubai(r.createdAt),
        r.fullName,
        r.occupation,
        r.email,
        r.phone,
        r.roomPreference,
        formatDate(r.moveInDate),
        r.lengthOfStay,
        r.status,
        r.source,
        r.message,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="darshe-enquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
