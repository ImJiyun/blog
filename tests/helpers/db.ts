import { prisma } from "../../src/lib/prisma";

const DEFAULT_CATEGORIES: { name: string; section: string | null; sortOrder: number }[] = [
  { name: "SQL", section: "data", sortOrder: 0 },
  { name: "Python", section: "data", sortOrder: 1 },
  { name: "Statistics", section: "data", sortOrder: 2 },
  { name: "Tableau", section: "data", sortOrder: 3 },
  { name: "PowerBI", section: "data", sortOrder: 4 },
  { name: "Projects", section: null, sortOrder: 5 },
  { name: "Travel", section: "life", sortOrder: 6 },
  { name: "Career", section: "life", sortOrder: 7 },
];

export async function resetDb(): Promise<void> {
  await prisma.$transaction([
    prisma.loginAttempt.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.category.createMany({ data: DEFAULT_CATEGORIES }),
  ]);
}
