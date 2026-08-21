import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && !isAdmin(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
  // jsonwebtoken relies on Node's crypto module, which the default Edge
  // runtime doesn't support (jwt.verify throws there and isAdmin() always
  // returns false) — run middleware in the Node.js runtime instead.
  runtime: "nodejs",
};
