import { sendGAEvent } from "@next/third-parties/google";

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!Array.isArray(w.dataLayer)) return;
  sendGAEvent("event", name, params);
}

export function shouldEnableGA({
  nodeEnv,
  gaMeasurementId,
  isAdminSession,
}: {
  nodeEnv: string | undefined;
  gaMeasurementId: string | undefined;
  isAdminSession: boolean;
}): boolean {
  return nodeEnv === "production" && !!gaMeasurementId && !isAdminSession;
}

export const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export function crossedThresholds(
  percent: number,
  alreadyFired: number[],
): number[] {
  return SCROLL_DEPTH_THRESHOLDS.filter(
    (threshold) => percent >= threshold && !alreadyFired.includes(threshold),
  );
}

export function computeReadingSeconds(startMs: number, endMs: number): number {
  return Math.max(0, Math.round((endMs - startMs) / 1000));
}
