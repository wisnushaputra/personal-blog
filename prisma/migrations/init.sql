-- Wisnu Blog — Initial Migration
-- Generated from prisma/schema.prisma (DATABASE.md §5)
-- Run this in Supabase SQL Editor if prisma migrate dev fails

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AUTHOR');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: users
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'AUTHOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: categories
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: tags
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable: posts
CREATE TABLE "posts" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" VARCHAR(300),
    "thumbnail" VARCHAR(255),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "author_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: post_tags (pivot)
CREATE TABLE "post_tags" (
    "post_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,
    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable: comments
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "post_id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: subscribers
CREATE TABLE "subscribers" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: media
CREATE TABLE "media" (
    "id" BIGSERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "uploaded_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- Unique Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- Performance Indexes
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at");
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");
CREATE INDEX "posts_category_id_idx" ON "posts"("category_id");
CREATE INDEX "post_tags_tag_id_idx" ON "post_tags"("tag_id");
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");
CREATE INDEX "comments_status_idx" ON "comments"("status");
CREATE INDEX "media_uploaded_by_idx" ON "media"("uploaded_by");

-- Foreign Keys
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
