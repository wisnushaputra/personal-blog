import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { updateTagSchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// PUT /api/tags/[id] - Update tag (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return errorResponse('NOT_FOUND', 'Tag tidak ditemukan', 404);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateTagSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Handle slug updates
    let slug = existingTag.slug;
    if (data.name && !data.slug) {
      slug = generateSlug(data.name);
    } else if (data.slug) {
      slug = data.slug;
    }

    if (slug !== existingTag.slug) {
      slug = await ensureUniqueSlug(
        slug,
        async (s) => {
          const existing = await prisma.tag.findUnique({ where: { slug: s } });
          return !!existing;
        },
        existingTag.slug
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (slug !== undefined) updateData.slug = slug;

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/tag/${existingTag.slug}`);
    if (slug !== existingTag.slug) {
      revalidatePath(`/tag/${slug}`);
    }

    return successResponse({
      id: updatedTag.id.toString(),
      name: updatedTag.name,
      slug: updatedTag.slug,
    });
  } catch (error) {
    console.error('PUT /api/tags/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/tags/[id] - Delete tag (admin only)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return errorResponse('NOT_FOUND', 'Tag tidak ditemukan', 404);
    }

    // Delete tag. Post-tag links in post_tags table will be cascade deleted automatically (onDelete: Cascade in schema.prisma)
    await prisma.tag.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/tag/${tag.slug}`);

    return successResponse({
      id: tag.id.toString(),
      deleted: true,
    });
  } catch (error) {
    console.error('DELETE /api/tags/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
