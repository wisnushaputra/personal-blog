import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { createCategorySchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const transformed = categories.map((cat) => ({
      id: cat.id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      postCount: cat._count.posts,
    }));

    return successResponse(transformed);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Parse and validate body
    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Generate unique slug
    let slug = data.slug || generateSlug(data.name);
    slug = await ensureUniqueSlug(slug, async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
      },
    });

    // Revalidate paths
    revalidatePath('/');

    return successResponse(
      {
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
