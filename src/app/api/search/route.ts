import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successListResponse, errorResponse, parsePagination } from '@/lib/api';
import { searchSchema } from '@/lib/validation';

// GET /api/search - Full-text search for posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);

    // Get search query
    const q = searchParams.get('q');

    // Validate query
    if (!q) {
      return errorResponse('BAD_REQUEST', 'Parameter q (query) wajib diisi', 400);
    }

    const validation = searchSchema.safeParse({ q });
    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const searchQuery = validation.data.q;

    // Build search filter (ILIKE for PostgreSQL)
    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { excerpt: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        {
          tags: {
            some: {
              tag: { name: { contains: searchQuery, mode: 'insensitive' } },
            },
          },
        },
      ],
    };

    // Execute query
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
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
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Transform response
    const transformed = posts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
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
      publishedAt: post.publishedAt?.toISOString() || null,
      views: post.views,
    }));

    return successListResponse(transformed, { page, limit, total });
  } catch (error) {
    console.error('GET /api/search error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
