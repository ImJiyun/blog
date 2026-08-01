import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

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
      { error: `Too many attempts, try again in ${minutesLeft} minutes` },
      { status: 429 },
    );
  }

  const { password } = await request.json();
  const isPastLockout = !!attempt?.lockedUntil && attempt.lockedUntil <= now;
  const currentFailedCount = isPastLockout ? 0 : (attempt?.failedCount ?? 0);

  if (
    typeof password !== "string" ||
    !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)
  ) {
    const failedCount = currentFailedCount + 1;
    const lockedUntil =
      failedCount >= MAX_FAILED_ATTEMPTS
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60000)
        : null;
    await prisma.loginAttempt.upsert({
      where: { ip },
      create: { ip, failedCount, lockedUntil },
      update: { failedCount, lockedUntil },
    });
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  if (attempt) {
    await prisma.loginAttempt.delete({ where: { ip } });
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
