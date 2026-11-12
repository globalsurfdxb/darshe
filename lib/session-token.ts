// Edge-safe helpers (used by middleware as well as server code): no Node-only imports.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "darshe_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function signSession(): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = getKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
