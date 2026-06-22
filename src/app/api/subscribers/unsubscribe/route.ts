import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { revalidatePath } from 'next/cache';

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * Verify unsubscribe token and return the email if valid.
 * Token format: base64({ email: string, hash: string })
 * Hash is HMAC-SHA256 of email + SECRET.
 */
function verifyUnsubscribeToken(token: string): string | null {
  if (!SECRET) {
    console.error('NEXTAUTH_SECRET is not defined. Cannot verify unsubscribe token.');
    return null;
  }

  try {
    const decodedBuffer = Buffer.from(token, 'base64');
    const decodedString = decodedBuffer.toString();
    const data = JSON.parse(decodedString);

    if (!data.email || !data.hash) {
      return null;
    }

    const expectedHash = crypto.createHmac('sha256', SECRET).update(data.email).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(data.hash), Buffer.from(expectedHash))) {
      return data.email;
    }
  } catch (e) {
    console.error('Error verifying unsubscribe token:', e);
    // Ignore errors, treat as invalid token
  }

  return null;
}

// GET /api/subscribers/unsubscribe - Unsubscribe user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('BAD_REQUEST', 'Token unsubscribe dibutuhkan', 400);
    }

    const email = verifyUnsubscribeToken(token);

    if (!email) {
      return errorResponse('BAD_REQUEST', 'Token unsubscribe tidak valid atau kedaluwarsa', 400);
    }

    // Find and delete subscriber
    const deletedSubscriber = await prisma.subscriber.delete({
      where: { email },
    });

    // Revalidate paths (if needed - unsubscribe doesn't usually affect public pages, but good practice)
    revalidatePath('/');

    // Redirect to a confirmation page or show a success message
    // For now, just returning a success response
    return successResponse({
      message: `Email ${email} berhasil dihapus dari daftar newsletter.`,
      email: deletedSubscriber.email,
    });
  } catch (error: any) {
    // Handle cases where email might not be found if token is valid but subscriber deleted
    if (error.code === 'P2025') {
      // Prisma error for record not found
      return errorResponse('NOT_FOUND', 'Subscriber tidak ditemukan', 404);
    }

    console.error('GET /api/subscribers/unsubscribe error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
