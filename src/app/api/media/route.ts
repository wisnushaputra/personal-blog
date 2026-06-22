import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, successListResponse, errorResponse, parsePagination } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validation';
// NOTE: Assuming Cloudinary for media storage as per project dependencies (next-cloudinary)
// If Vercel Blob is used, this logic would change to Vercel Blob API.
// Since package.json has 'next-cloudinary', we will use that pattern.
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/media - List media (admin only)
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count(),
    ]);

    const transformed = media.map((item) => ({
      id: item.id.toString(),
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      createdAt: item.createdAt.toISOString(),
    }));

    return successListResponse(transformed, { page, limit, total });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/media - Upload file (admin only)
export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await requireAdminAuth();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('BAD_REQUEST', 'File tidak ditemukan', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Tipe file tidak didukung. Gunakan jpg, png, webp, atau gif',
        422
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('VALIDATION_ERROR', 'Ukuran file terlalu besar (maks 5MB)', 422);
    }

    // Convert file to base64 for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'wisnu-blog',
      resource_type: 'image',
    });

    // Save to DB
    const media = await prisma.media.create({
      data: {
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        uploadedBy: BigInt(user.id),
      },
    });

    return successResponse(
      {
        id: media.id.toString(),
        fileName: media.fileName,
        fileUrl: media.fileUrl,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/media error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
