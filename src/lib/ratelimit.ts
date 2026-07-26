const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, maxCalls = 5, windowSeconds = 60): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
  if (timestamps.length >= maxCalls) {
    hits.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}

export function resetRateLimits(): void {
  hits.clear();
}
