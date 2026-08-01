import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "./helpers/db";

describe("LoginAttempt model", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("stores failedCount and lockedUntil per IP, defaulting failedCount to 0", async () => {
    const created = await prisma.loginAttempt.create({ data: { ip: "1.2.3.4" } });
    expect(created.failedCount).toBe(0);
    expect(created.lockedUntil).toBeNull();

    const fetched = await prisma.loginAttempt.findUnique({ where: { ip: "1.2.3.4" } });
    expect(fetched?.failedCount).toBe(0);
    expect(fetched?.lockedUntil).toBeNull();
  });

  it("upserts by ip instead of creating duplicate rows", async () => {
    await prisma.loginAttempt.create({ data: { ip: "5.6.7.8", failedCount: 1 } });
    await prisma.loginAttempt.update({
      where: { ip: "5.6.7.8" },
      data: { failedCount: 2 },
    });

    const rows = await prisma.loginAttempt.findMany({ where: { ip: "5.6.7.8" } });
    expect(rows).toHaveLength(1);
    expect(rows[0].failedCount).toBe(2);
  });
});
