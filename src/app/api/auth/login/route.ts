import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Cloud Run's Google Front End appends the real client IP to the end of any
// existing X-Forwarded-For header, so the last entry is the trusted one — the
// first entry is whatever the caller supplied and is fully spoofable on a
// direct API call.
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",").pop()?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const now = new Date();

  const attempt = await prisma.loginAttempt.findUnique({ where: { ip } });
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 60000);
    return NextResponse.json(
      {
        error: `Too many attempts, try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`,
      },
      { status: 429 },
    );
  }

  const { password } = await request.json();
  const isPastLockout = !!attempt?.lockedUntil && attempt.lockedUntil <= now;

  if (
    typeof password !== "string" ||
    !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)
  ) {
    const updated = await prisma.loginAttempt.upsert({
      where: { ip },
      create: { ip, failedCount: 1 },
      update: isPastLockout
        ? { failedCount: 1, lockedUntil: null }
        : { failedCount: { increment: 1 } },
    });
    if (updated.failedCount >= MAX_FAILED_ATTEMPTS && !updated.lockedUntil) {
      await prisma.loginAttempt.update({
        where: { ip },
        data: { lockedUntil: new Date(now.getTime() + LOCKOUT_MINUTES * 60000) },
      });
    }
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  if (attempt) {
    await prisma.loginAttempt.deleteMany({ where: { ip } });
  }

  const token = createToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
