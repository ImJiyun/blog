import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const JWT_EXPIRES_IN = "7d";

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function createToken(): string {
  return jwt.sign({ sub: "admin" }, process.env.JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;
  return verifyToken(token);
}
