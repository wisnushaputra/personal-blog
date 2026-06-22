import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE /api/media/[id] - Delete media (admin only)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);

    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return errorResponse('NOT_FOUND', 'Media tidak ditemukan', 404);
    }

    // Extract public_id from Cloudinary URL for deletion
    // Expected URL format: https://res.cloudinary.com/.../image/upload/v12345/wisnu-blog/file_name.webp
    // A simpler way is to try deleting based on public_id if stored, but here we delete by public ID
    // We can extract public ID if it follows the folder structure 'wisnu-blog/...'
    const publicId = media.fileUrl.split('/').slice(-2).join('/').split('.')[0]; // Assuming folder 'wisnu-blog' and file name

    // Attempt to delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.error('Cloudinary delete error:', e);
      // Continue even if Cloudinary fails, or throw error?
      // Better to throw error to prevent orphaned DB record
      return errorResponse('INTERNAL_ERROR', 'Gagal menghapus file dari storage', 500);
    }

    // Delete from DB
    await prisma.media.delete({
      where: { id },
    });

    return successResponse({
      id: media.id.toString(),
      deleted: true,
    });
  } catch (error) {
    console.error('DELETE /api/media/[id] error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
