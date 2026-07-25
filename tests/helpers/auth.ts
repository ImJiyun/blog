import { createToken } from "../../src/lib/auth";

export function adminCookieHeader(): string {
  return `token=${createToken()}`;
}
