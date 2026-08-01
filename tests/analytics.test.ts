import { describe, it, expect } from "vitest";
import {
  trackEvent,
  shouldEnableGA,
  crossedThresholds,
  computeReadingSeconds,
} from "@/lib/analytics";

describe("shouldEnableGA", () => {
  it("enables in production with a GA id and no admin session", () => {
    expect(
      shouldEnableGA({ nodeEnv: "production", gaMeasurementId: "G-XYZ", isAdminSession: false }),
    ).toBe(true);
  });

  it("disables for an admin session even in production", () => {
    expect(
      shouldEnableGA({ nodeEnv: "production", gaMeasurementId: "G-XYZ", isAdminSession: true }),
    ).toBe(false);
  });

  it("disables outside production", () => {
    expect(
      shouldEnableGA({ nodeEnv: "development", gaMeasurementId: "G-XYZ", isAdminSession: false }),
    ).toBe(false);
  });

  it("disables when no GA id is configured", () => {
    expect(
      shouldEnableGA({ nodeEnv: "production", gaMeasurementId: undefined, isAdminSession: false }),
    ).toBe(false);
  });
});

describe("crossedThresholds", () => {
  it("returns the first threshold reached", () => {
    expect(crossedThresholds(30, [])).toEqual([25]);
  });

  it("returns every threshold newly reached in one jump", () => {
    expect(crossedThresholds(80, [25])).toEqual([50, 75]);
  });

  it("excludes thresholds already fired", () => {
    expect(crossedThresholds(100, [25, 50, 75, 100])).toEqual([]);
  });

  it("returns nothing below the first threshold", () => {
    expect(crossedThresholds(10, [])).toEqual([]);
  });
});

describe("computeReadingSeconds", () => {
  it("rounds elapsed milliseconds to seconds", () => {
    expect(computeReadingSeconds(0, 5432)).toBe(5);
  });

  it("clamps a negative elapsed time to zero", () => {
    expect(computeReadingSeconds(1000, 500)).toBe(0);
  });
});

describe("trackEvent", () => {
  it("does not throw when window is undefined (server/test environment)", () => {
    expect(() => trackEvent("click", { target_type: "like" })).not.toThrow();
  });
});
