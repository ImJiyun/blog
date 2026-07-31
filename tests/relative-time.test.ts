import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "@/lib/relativeTime";

const NOW = new Date("2026-08-01T12:00:00.000Z");

function isoMsAgo(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

describe("formatRelativeTime", () => {
  it("returns 방금 전 for under a minute", () => {
    expect(formatRelativeTime(isoMsAgo(59 * 1000), NOW)).toBe("방금 전");
  });

  it("switches to N분 전 at exactly one minute", () => {
    expect(formatRelativeTime(isoMsAgo(60 * 1000), NOW)).toBe("1분 전");
    expect(formatRelativeTime(isoMsAgo(59 * 60 * 1000), NOW)).toBe("59분 전");
  });

  it("switches to N시간 전 at exactly one hour", () => {
    expect(formatRelativeTime(isoMsAgo(60 * 60 * 1000), NOW)).toBe("1시간 전");
    expect(formatRelativeTime(isoMsAgo(23 * 60 * 60 * 1000), NOW)).toBe("23시간 전");
  });

  it("switches to N일 전 at exactly one day", () => {
    expect(formatRelativeTime(isoMsAgo(24 * 60 * 60 * 1000), NOW)).toBe("1일 전");
    expect(formatRelativeTime(isoMsAgo(6 * 24 * 60 * 60 * 1000), NOW)).toBe("6일 전");
  });

  it("falls back to an absolute date at 7 days and beyond", () => {
    const iso = isoMsAgo(7 * 24 * 60 * 60 * 1000);
    const expected = new Date(iso).toLocaleDateString("ko-KR");
    expect(formatRelativeTime(iso, NOW)).toBe(expected);
  });
});
