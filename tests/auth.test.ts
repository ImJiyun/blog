import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma";
import { resetDb } from "./helpers/db";

function loginRequest(password: string, ip?: string) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
    headers: {
      "Content-Type": "application/json",
      ...(ip ? { "x-forwarded-for": ip } : {}),
    },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects the wrong password", async () => {
    const response = await POST(loginRequest("not-it"));
    expect(response.status).toBe(401);
  });

  it("accepts the correct password and sets an httpOnly cookie", async () => {
    const response = await POST(loginRequest("test-password"));
    expect(response.status).toBe(200);
    const cookie = response.cookies.get("token");
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
  });
});

describe("POST /api/auth/login — lockout", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("locks out after 5 consecutive failed attempts from the same IP", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await POST(loginRequest("wrong", "1.2.3.4"));
      expect(response.status).toBe(401);
    }

    const response = await POST(loginRequest("test-password", "1.2.3.4"));
    expect(response.status).toBe(429);
  });

  it("includes remaining lockout minutes in the 429 response", async () => {
    for (let i = 0; i < 5; i++) {
      await POST(loginRequest("wrong", "1.2.3.4"));
    }

    const response = await POST(loginRequest("wrong", "1.2.3.4"));
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toMatch(/\d+ minutes?/);
  });

  it("resets the counter after a successful login", async () => {
    await POST(loginRequest("wrong", "5.6.7.8"));
    await POST(loginRequest("wrong", "5.6.7.8"));
    await POST(loginRequest("test-password", "5.6.7.8"));

    for (let i = 0; i < 4; i++) {
      const response = await POST(loginRequest("wrong", "5.6.7.8"));
      expect(response.status).toBe(401);
    }
    const response = await POST(loginRequest("test-password", "5.6.7.8"));
    expect(response.status).toBe(200);
  });

  it("does not let one IP's failures lock out another IP", async () => {
    for (let i = 0; i < 5; i++) {
      await POST(loginRequest("wrong", "9.9.9.9"));
    }

    const response = await POST(loginRequest("test-password", "1.1.1.1"));
    expect(response.status).toBe(200);
  });

  it("allows retrying once the lockout window has passed", async () => {
    for (let i = 0; i < 5; i++) {
      await POST(loginRequest("wrong", "2.2.2.2"));
    }
    await prisma.loginAttempt.update({
      where: { ip: "2.2.2.2" },
      data: { lockedUntil: new Date(Date.now() - 1000) },
    });

    const response = await POST(loginRequest("test-password", "2.2.2.2"));
    expect(response.status).toBe(200);
  });
});
