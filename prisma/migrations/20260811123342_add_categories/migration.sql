-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- Seed default categories (matches current DATA_CATEGORIES / DEV_CATEGORIES / LIFE_CATEGORIES /
-- Projects in src/lib/api.ts, which this migration's later steps make obsolete)
INSERT INTO "categories" ("id", "name", "section", "sort_order") VALUES
    (gen_random_uuid(), 'SQL', 'data', 0),
    (gen_random_uuid(), 'Python', 'data', 1),
    (gen_random_uuid(), 'Statistics', 'data', 2),
    (gen_random_uuid(), 'Tableau', 'data', 3),
    (gen_random_uuid(), 'PowerBI', 'data', 4),
    (gen_random_uuid(), 'Projects', NULL, 5),
    (gen_random_uuid(), 'Travel', 'life', 6),
    (gen_random_uuid(), 'Career', 'life', 7);

-- AlterTable: add category_id nullable first so existing rows don't fail the ADD COLUMN
ALTER TABLE "posts" ADD COLUMN "category_id" UUID;

-- Backfill: match each post's old free-text category to the seeded row by name
UPDATE "posts" SET "category_id" = "categories"."id"
FROM "categories"
WHERE "posts"."category" = "categories"."name";

-- Any post whose old category string didn't match a seeded name falls back to "SQL" rather
-- than leaving category_id NULL, since the next step makes it NOT NULL. Shouldn't happen given
-- the seed list above matches src/lib/api.ts's ALL_CATEGORIES exactly, but guards against drift.
UPDATE "posts" SET "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'SQL')
WHERE "category_id" IS NULL;

-- Now safe to enforce NOT NULL and drop the old free-text column
ALTER TABLE "posts" ALTER COLUMN "category_id" SET NOT NULL;
ALTER TABLE "posts" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
