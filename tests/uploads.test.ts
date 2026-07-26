import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { adminCookieHeader } from "./helpers/auth";

const saveMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@google-cloud/storage", () => ({
  Storage: vi.fn().mockImplementation(() => ({
    bucket: () => ({ file: () => ({ save: saveMock }) }),
  })),
}));

process.env.GCS_BUCKET_NAME = "test-bucket";

const { POST } = await import("@/app/api/uploads/route");

function uploadRequest(authed: boolean) {
  const formData = new FormData();
  formData.set("file", new File(["data"], "a.png", { type: "image/png" }));
  return new NextRequest("http://localhost/api/uploads", {
    method: "POST",
    body: formData,
    headers: authed ? { Cookie: adminCookieHeader() } : {},
  });
}

describe("POST /api/uploads", () => {
  beforeEach(() => saveMock.mockClear());

  it("requires admin", async () => {
    const response = await POST(uploadRequest(false));
    expect(response.status).toBe(401);
  });

  it("uploads a file and returns its public URL", async () => {
    const response = await POST(uploadRequest(true));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.url).toContain("test-bucket");
    expect(saveMock).toHaveBeenCalledOnce();
  });
});
