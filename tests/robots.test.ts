import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

describe("robots", () => {
  it("allows all crawlers", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("points crawlers at the sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${BASE_URL}/sitemap.xml`);
  });
});
