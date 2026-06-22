import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { updateCommentStatusSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

// PATCH /api/comments/[id] - Approve/reject comment (admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { slug: true, category: true },
        },
      },
    });

    if (!comment) {
      return errorResponse('NOT_FOUND', 'Komentar tidak ditemukan', 404);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateCommentStatusSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const { status } = validation.data;

    // Update comment status
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    // Revalidate affected post pages
    revalidatePath(`/${comment.post.slug}`);
    revalidatePath('/');
    if (comment.post.category) {
      revalidatePath(`/${comment.post.category.slug}`);
    }

    return successResponse({
      id: updatedComment.id.toString(),
      status: updatedComment.status,
    });
  } catch (error) {
    console.error('PATCH /api/comments/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/comments/[id] - Delete comment (admin only)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { slug: true, category: true },
        },
      },
    });

    if (!comment) {
      return errorResponse('NOT_FOUND', 'Komentar tidak ditemukan', 404);
    }

    // Delete comment (all replies will be cascade deleted automatically by Prisma)
    await prisma.comment.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath(`/${comment.post.slug}`);
    revalidatePath('/');
    if (comment.post.category) {
      revalidatePath(`/${comment.post.category.slug}`);
    }

    return successResponse({
      id: comment.id.toString(),
      deleted: true,
    });
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
