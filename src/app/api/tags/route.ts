import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { createTagSchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const transformed = tags.map((tag) => ({
      id: tag.id.toString(),
      name: tag.name,
      slug: tag.slug,
      postCount: tag._count.posts,
    }));

    return successResponse(transformed);
  } catch (error) {
    console.error('GET /api/tags error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/tags - Create new tag (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Parse and validate body
    const body = await request.json();
    const validation = createTagSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Generate unique slug
    let slug = data.slug || generateSlug(data.name);
    slug = await ensureUniqueSlug(slug, async (s) => {
      const existing = await prisma.tag.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug,
      },
    });

    // Revalidate paths
    revalidatePath('/');

    return successResponse(
      {
        id: tag.id.toString(),
        name: tag.name,
        slug: tag.slug,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/tags error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
