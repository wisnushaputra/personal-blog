import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/apiAuth';

// GET /api/posts/[slug] - Get post by slug
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Check if user is authenticated (for draft/scheduled posts)
    const session = await requireAuth();
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'AUTHOR';

    // Build query
    const where: any = { slug };
    if (!isAdmin) {
      // Public can only see published posts
      where.status = 'PUBLISHED';
    }

    // Fetch post with related data
    const post = await prisma.post.findFirst({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        comments: {
          where: { status: 'APPROVED', parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            replies: {
              where: { status: 'APPROVED' },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!post) {
      return errorResponse('NOT_FOUND', 'Artikel tidak ditemukan', 404);
    }

    // Increment view count asynchronously (don't await)
    prisma.post
      .update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      .catch(console.error);

    // Transform response
    const response = {
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
      status: post.status,
      views: post.views,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: {
        id: post.author.id.toString(),
        name: post.author.name,
        avatar: post.author.avatar,
      },
      category: post.category
        ? {
            id: post.category.id.toString(),
            name: post.category.name,
            slug: post.category.slug,
          }
        : null,
      tags: post.tags.map((pt) => ({
        id: pt.tag.id.toString(),
        name: pt.tag.name,
        slug: pt.tag.slug,
      })),
      comments: post.comments.map((comment) => ({
        id: comment.id.toString(),
        name: comment.name,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        replies: comment.replies.map((reply) => ({
          id: reply.id.toString(),
          name: reply.name,
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
        })),
      })),
    };

    return successResponse(response);
  } catch (error) {
    console.error('GET /api/posts/[slug] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
