"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, startAdminSession } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export type LoginState = { error?: string };

/** Only allow redirects back into /admin (never to another origin). */
function safeNext(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/admin") && !v.startsWith("//") && !v.startsWith("/admin/login")
    ? v
    : "/admin/enquiries";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = getClientIp(await headers());
  const limit = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    console.error("[admin] ADMIN_PASSWORD or SESSION_SECRET is not configured.");
    return { error: "Admin sign-in is not configured on this server." };
  }

  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    return { error: "That password is not correct." };
  }

  await startAdminSession();
  redirect(safeNext(formData.get("next")));
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
