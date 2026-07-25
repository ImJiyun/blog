import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/ratelimit";

beforeEach(resetRateLimits);

describe("checkRateLimit", () => {
  it("allows up to max calls", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("key-a", 3, 60)).toBe(true);
    }
  });

  it("blocks after max calls", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("key-b", 3, 60);
    expect(checkRateLimit("key-b", 3, 60)).toBe(false);
  });

  it("keeps different keys independent", () => {
    checkRateLimit("key-c", 1, 60);
    expect(checkRateLimit("key-d", 1, 60)).toBe(true);
  });
});
