-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body_md" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "read_minutes" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "author_name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "likes_post_id_visitor_id_key" ON "likes"("post_id", "visitor_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
