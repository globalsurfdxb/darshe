import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEnquiryNotification } from "@/lib/email";
import { enquirySchema, fieldErrors } from "@/lib/enquiry-schema";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_HOUR = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  // Reject oversized payloads before parsing.
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

  // Honeypot: real visitors never see this field. Pretend success so bots learn nothing.
  const honeypot = (body as Record<string, unknown>).company;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);

  const limit = rateLimit(`enquiry:${ipHash}`, { limit: MAX_PER_HOUR, windowMs: ONE_HOUR_MS });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const enquiry = await db.enquiry.create({
      data: {
        fullName: data.fullName,
        occupation: data.occupation,
        email: data.email,
        phone: data.phone,
        roomPreference: data.roomPreference,
        moveInDate: new Date(`${data.moveInDate}T00:00:00.000Z`),
        lengthOfStay: data.lengthOfStay,
        message: data.message || null,
        consent: data.consent,
        source: data.source || null,
        ipHash,
      },
    });

    // Awaited so serverless runtimes do not freeze it mid-flight; never throws.
    await sendEnquiryNotification({
      id: enquiry.id,
      fullName: data.fullName,
      occupation: data.occupation,
      email: data.email,
      phone: data.phone,
      roomPreference: data.roomPreference,
      moveInDate: data.moveInDate,
      lengthOfStay: data.lengthOfStay,
      message: data.message,
      source: data.source,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[enquiries] Failed to save enquiry:", error);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
