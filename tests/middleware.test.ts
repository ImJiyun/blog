import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("middleware", () => {
  it("redirects unauthenticated /admin/* requests to home", () => {
    const request = new NextRequest("http://localhost/admin/posts");
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("lets authenticated requests through to /admin/*", () => {
    const request = new NextRequest("http://localhost/admin/posts", {
      headers: { cookie: "token=some-token" },
    });
    const response = middleware(request);
    expect(response.status).toBe(200);
  });

  it("does not touch non-admin routes", () => {
    const request = new NextRequest("http://localhost/posts");
    const response = middleware(request);
    expect(response.status).toBe(200);
  });
});
