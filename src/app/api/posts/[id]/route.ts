import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuthorAuth } from '@/lib/apiAuth';
import { updatePostSchema } from '@/lib/validation';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// PUT /api/posts/[id] - Update post (admin/author only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError, user } = await requireAuthorAuth();
    if (authError) return authError;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existingPost) {
      return errorResponse('NOT_FOUND', 'Artikel tidak ditemukan', 404);
    }

    // Authorization: Author can only update their own post, Admin can update any
    if (user.role !== 'ADMIN' && existingPost.authorId !== BigInt(user.id)) {
      return errorResponse('FORBIDDEN', 'Anda tidak memiliki akses ke artikel ini', 403);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const data = validation.data;

    // Handle slug updates
    let slug = existingPost.slug;
    if (data.title && !data.slug) {
      slug = generateSlug(data.title);
    } else if (data.slug) {
      slug = data.slug;
    }

    if (slug !== existingPost.slug) {
      slug = await ensureUniqueSlug(
        slug,
        async (s) => {
          const existing = await prisma.post.findUnique({ where: { slug: s } });
          return !!existing;
        },
        existingPost.slug
      );
    }

    // Set publishedAt logic
    let publishedAt = existingPost.publishedAt;
    if (data.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    } else if (data.publishedAt !== undefined) {
      publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    }

    // Prepare update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (slug !== undefined) updateData.slug = slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.status !== undefined) updateData.status = data.status;
    updateData.publishedAt = publishedAt;

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId ? BigInt(data.categoryId) : null;
    }

    // Update tags using transaction if tagIds are provided
    const updatedPost = await prisma.$transaction(async (tx) => {
      // If tagIds are provided, handle updating tag connections
      if (data.tagIds !== undefined) {
        // Disconnect existing tags
        await tx.postTag.deleteMany({
          where: { postId: id },
        });

        // Connect new tags
        if (data.tagIds.length > 0) {
          await tx.postTag.createMany({
            data: data.tagIds.map((tagId) => ({
              postId: id,
              tagId: BigInt(tagId),
            })),
          });
        }
      }

      // Update the post itself
      return tx.post.update({
        where: { id },
        data: updateData,
      });
    });

    // Revalidate paths for cache update
    revalidatePath('/');
    revalidatePath(`/${existingPost.slug}`);
    if (slug !== existingPost.slug) {
      revalidatePath(`/${slug}`);
    }

    // Revalidate old and new category paths
    if (existingPost.category) {
      revalidatePath(`/${existingPost.category.slug}`);
    }
    if (data.categoryId) {
      const newCategory = await prisma.category.findUnique({
        where: { id: BigInt(data.categoryId) },
      });
      if (newCategory) {
        revalidatePath(`/${newCategory.slug}`);
      }
    }

    return successResponse({
      id: updatedPost.id.toString(),
      slug: updatedPost.slug,
      status: updatedPost.status,
    });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/posts/[id] - Delete post (admin/author only)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError, user } = await requireAuthorAuth();
    if (authError) return authError;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!post) {
      return errorResponse('NOT_FOUND', 'Artikel tidak ditemukan', 404);
    }

    // Authorization: Author can only delete their own post, Admin can delete any
    if (user.role !== 'ADMIN' && post.authorId !== BigInt(user.id)) {
      return errorResponse(
        'FORBIDDEN',
        'Anda tidak memiliki akses untuk menghapus artikel ini',
        403
      );
    }

    // Delete post (comments and tags will be cascade deleted)
    await prisma.post.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/${post.slug}`);
    if (post.category) {
      revalidatePath(`/${post.category.slug}`);
    }

    return successResponse({
      id: post.id.toString(),
      deleted: true,
    });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
