import { z } from 'zod';

// ─── Posts Validation ───────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi').max(255),
  slug: z.string().max(255).optional(),
  content: z.string().min(1, 'Konten harus diisi'),
  excerpt: z.string().max(300).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  categoryId: z.string().transform(Number).optional().nullable(),
  tagIds: z.array(z.string().transform(Number)).optional().default([]),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial();

// ─── Categories Validation ──────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi').max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(300).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Tags Validation ────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1, 'Nama tag harus diisi').max(100),
  slug: z.string().max(100).optional(),
});

export const updateTagSchema = createTagSchema.partial();

// ─── Comments Validation ────────────────────────────────────────

export const createCommentSchema = z.object({
  postId: z.string().transform(Number),
  parentId: z.string().transform(Number).optional().nullable(),
  name: z.string().min(1, 'Nama harus diisi').max(100),
  email: z.string().email('Email tidak valid'),
  content: z.string().min(1, 'Komentar harus diisi'),
});

export const updateCommentStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

// ─── Subscribers Validation ─────────────────────────────────────

export const createSubscriberSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

// ─── Media Validation ───────────────────────────────────────────

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ─── Search Validation ──────────────────────────────────────────

export const searchSchema = z.object({
  q: z.string().min(1, 'Query harus diisi').max(255),
});

// ─── Type exports ───────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusSchema>;
export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
