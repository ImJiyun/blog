import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";

function loginRequest(password: string) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
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
