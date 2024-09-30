import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nextBasicAuthMiddleware } from "nextjs-basic-auth-middleware";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    process.env.BASIC_AUTH_ENABLED === "true" &&
    path !== "/api/telegram/webhook"
  ) {
    const response = nextBasicAuthMiddleware(undefined, request);
    if (response.status === 401) return response;
  }

  const headers = new Headers(request.headers);
  headers.set("x-current-path", path);
  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
