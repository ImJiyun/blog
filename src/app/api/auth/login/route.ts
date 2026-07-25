import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (
    typeof password !== "string" ||
    !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)
  ) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
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
