import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { updateCategorySchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// PUT /api/categories/[id] - Update category (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return errorResponse('NOT_FOUND', 'Kategori tidak ditemukan', 404);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Handle slug updates
    let slug = existingCategory.slug;
    if (data.name && !data.slug) {
      slug = generateSlug(data.name);
    } else if (data.slug) {
      slug = data.slug;
    }

    if (slug !== existingCategory.slug) {
      slug = await ensureUniqueSlug(
        slug,
        async (s) => {
          const existing = await prisma.category.findUnique({ where: { slug: s } });
          return !!existing;
        },
        existingCategory.slug
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (slug !== undefined) updateData.slug = slug;
    if (data.description !== undefined) updateData.description = data.description;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/${existingCategory.slug}`);
    if (slug !== existingCategory.slug) {
      revalidatePath(`/${slug}`);
    }

    return successResponse({
      id: updatedCategory.id.toString(),
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    });
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return errorResponse('NOT_FOUND', 'Kategori tidak ditemukan', 404);
    }

    const postCount = category._count.posts;

    // If there are posts and force is not true, prevent deletion
    if (postCount > 0 && !force) {
      return errorResponse(
        'CONFLICT',
        `Kategori masih digunakan oleh ${postCount} artikel. Gunakan force=true untuk tetap menghapus.`,
        409
      );
    }

    // Delete category. Posts using this category will have categoryId set to null (due to onDelete: SetNull in schema)
    await prisma.category.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/${category.slug}`);

    return successResponse({
      id: category.id.toString(),
      deleted: true,
      affectedPosts: postCount,
    });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
