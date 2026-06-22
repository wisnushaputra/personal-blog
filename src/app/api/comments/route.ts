import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, successListResponse, errorResponse, parsePagination } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { createCommentSchema } from '@/lib/validation';
import { checkRateLimit, recordAttempt, getRateLimitReset } from '@/lib/rateLimit';
import { CommentStatus } from '@prisma/client';

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 menit
const RATE_LIMIT_MAX = 5;

// GET /api/comments - List comments for admin (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);

    // Build filters
    const where: any = {};
    const statusParam = searchParams.get('status');
    if (statusParam) {
      where.status = statusParam.toUpperCase() as CommentStatus;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const transformed = comments.map((comment) => ({
      id: comment.id.toString(),
      postId: comment.postId.toString(),
      parentId: comment.parentId?.toString() || null,
      name: comment.name,
      email: comment.email,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
      post: comment.post
        ? {
            id: comment.post.id.toString(),
            title: comment.post.title,
            slug: comment.post.slug,
          }
        : null,
    }));

    return successListResponse(transformed, { page, limit, total });
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/comments - Create new comment (public, rate-limited)
export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Check rate limit
    if (!checkRateLimit('comments', ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      const resetIn = getRateLimitReset('comments', ip, RATE_LIMIT_WINDOW);
      return errorResponse(
        'RATE_LIMITED',
        `Terlalu banyak komentar. Coba lagi dalam ${Math.ceil(resetIn / 60)} menit.`,
        429
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: BigInt(data.postId) },
    });

    if (!post || post.status !== 'PUBLISHED') {
      return errorResponse('NOT_FOUND', 'Artikel tidak ditemukan', 404);
    }

    // Check if parent comment exists (for replies)
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: BigInt(data.parentId) },
      });

      if (!parent || parent.postId !== BigInt(data.postId)) {
        return errorResponse(
          'BAD_REQUEST',
          'Balasan tidak valid (komentar induk tidak cocok dengan artikel)',
          400
        );
      }
    }

    // Create comment (always defaults to PENDING in schema)
    const comment = await prisma.comment.create({
      data: {
        postId: BigInt(data.postId),
        parentId: data.parentId ? BigInt(data.parentId) : null,
        name: data.name,
        email: data.email,
        content: data.content,
      },
    });

    // Record rate limit attempt
    recordAttempt('comments', ip, RATE_LIMIT_WINDOW);

    return successResponse(
      {
        id: comment.id.toString(),
        status: comment.status,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/comments error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
