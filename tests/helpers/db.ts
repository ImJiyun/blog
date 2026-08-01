import { prisma } from "../../src/lib/prisma";

export async function resetDb(): Promise<void> {
  await prisma.$transaction([
    prisma.loginAttempt.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
  ]);
}
