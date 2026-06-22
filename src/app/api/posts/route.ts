import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, successListResponse, errorResponse, parsePagination } from '@/lib/api';
import { requireAuth, requireAuthorAuth } from '@/lib/apiAuth';
import { createPostSchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { PostStatus } from '@prisma/client';

// GET /api/posts - List posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);

    // Check if user is authenticated for admin-only filters
    const session = await requireAuth();
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'AUTHOR';

    // Build filters
    const where: any = {};

    // Status filter (admin only)
    const statusParam = searchParams.get('status');
    if (statusParam && isAdmin) {
      where.status = statusParam.toUpperCase() as PostStatus;
    } else if (!isAdmin) {
      // Public can only see published posts
      where.status = 'PUBLISHED';
    }

    // Category filter
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Tag filter
    const tagSlug = searchParams.get('tag');
    if (tagSlug) {
      where.tags = {
        some: {
          tag: { slug: tagSlug },
        },
      };
    }

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
    const transformedPosts = posts.map((post) => ({
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
      status: post.status,
    }));

    return successListResponse(transformedPosts, { page, limit, total });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/posts - Create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { error: authError, user } = await requireAuthorAuth();
    if (authError) return authError;

    // Parse and validate body
    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Generate slug if not provided
    let slug = data.slug || generateSlug(data.title);

    // Ensure slug is unique
    slug = await ensureUniqueSlug(slug, async (s) => {
      const existing = await prisma.post.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Auto-set publishedAt if status is PUBLISHED and not provided
    let publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    if (data.status === 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date();
    }

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        thumbnail: data.thumbnail || null,
        status: data.status,
        publishedAt,
        authorId: BigInt(user.id),
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        tags: {
          create: data.tagIds.map((tagId) => ({
            tagId: BigInt(tagId),
          })),
        },
      },
    });

    // Revalidate paths for cache update
    revalidatePath('/');
    revalidatePath(`/${post.slug}`);
    if (post.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: post.categoryId },
      });
      if (category) {
        revalidatePath(`/${category.slug}`);
      }
    }

    return successResponse(
      {
        id: post.id.toString(),
        slug: post.slug,
        status: post.status,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
