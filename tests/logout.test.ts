import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("clears the token cookie", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/auth/logout", { method: "POST" }),
    );
    expect(response.status).toBe(200);
    const cookie = response.cookies.get("token");
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
  });
});
