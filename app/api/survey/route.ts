import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request-ip";
import { ALL_QUESTIONS, CONTACT, pickAnswers, validateQuestions } from "@/lib/survey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fairly generous: several women may share one office or home network.
const MAX_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 30_000;

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;

  // Honeypot: pretend success so bots learn nothing.
  if (typeof raw.company === "string" && raw.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ipHash = hashIp(getClientIp(request.headers));
  const limit = rateLimit(`survey:${ipHash}`, { limit: MAX_PER_HOUR, windowMs: ONE_HOUR_MS });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const { errors, cleaned } = validateQuestions(ALL_QUESTIONS, pickAnswers(raw.answers));
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const text = (id: string) => (typeof cleaned[id] === "string" ? (cleaned[id] as string) : null);
  const consent = text(CONTACT.consent);
  const source = typeof raw.source === "string" ? raw.source.trim().slice(0, 100) || null : null;

  try {
    await db.surveyResponse.create({
      data: {
        answers: cleaned as Prisma.InputJsonValue,
        firstName: text(CONTACT.firstName),
        email: text(CONTACT.email),
        whatsapp: text(CONTACT.whatsapp),
        contactConsent: consent === "Yes" ? true : consent === "No" ? false : null,
        source,
        ipHash,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[survey] Failed to save response:", error);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
