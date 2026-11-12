import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLogin = pathname === "/admin/login";
  const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  let response: NextResponse;
  if (isLogin) {
    // Already signed in: skip the login page.
    response = authed
      ? NextResponse.redirect(new URL("/admin/enquiries", request.url))
      : NextResponse.next();
  } else if (!authed) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
