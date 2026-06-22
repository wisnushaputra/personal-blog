import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { Role } from '@prisma/client';
import { errorResponse } from './api';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: errorResponse('UNAUTHORIZED', 'Sesi tidak valid, silakan login kembali', 401),
      user: null,
    };
  }

  const user = session.user as any;
  if (user.role !== Role.ADMIN) {
    return {
      error: errorResponse('FORBIDDEN', 'Anda tidak memiliki akses ke resource ini', 403),
      user: null,
    };
  }

  return { error: null, user };
}

export async function requireAuthorAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: errorResponse('UNAUTHORIZED', 'Sesi tidak valid, silakan login kembali', 401),
      user: null,
    };
  }

  const user = session.user as any;
  if (user.role !== Role.ADMIN && user.role !== Role.AUTHOR) {
    return {
      error: errorResponse('FORBIDDEN', 'Anda tidak memiliki akses ke resource ini', 403),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Get user ID from session, with type assertion for BigInt
 */
export function getUserId(session: any): string {
  return session?.user?.id as string;
}
