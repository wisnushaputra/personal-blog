import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, successListResponse, errorResponse, parsePagination } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';
import { createSubscriberSchema } from '@/lib/validation';
import { checkRateLimit, recordAttempt, getRateLimitReset } from '@/lib/rateLimit';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 jam
const RATE_LIMIT_MAX = 3;

// GET /api/subscribers - Get subscribers (admin only, supports format=csv)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format');

    // Fetch all subscribers for CSV export
    if (format === 'csv') {
      const subscribers = await prisma.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
      });

      // Generate CSV string
      const csvHeader = 'ID,Email,Subscribed At\n';
      const csvRows = subscribers
        .map((sub) => `"${sub.id.toString()}","${sub.email}","${sub.createdAt.toISOString()}"`)
        .join('\n');

      const csvContent = csvHeader + csvRows;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=subscribers.csv',
        },
      });
    }

    // Standard paginated JSON response
    const { page, limit, skip } = parsePagination(searchParams);

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriber.count(),
    ]);

    const transformed = subscribers.map((sub) => ({
      id: sub.id.toString(),
      email: sub.email,
      createdAt: sub.createdAt.toISOString(),
    }));

    return successListResponse(transformed, { page, limit, total });
  } catch (error) {
    console.error('GET /api/subscribers error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}

// POST /api/subscribers - Subscribe to newsletter (public, rate-limited, idempotent)
export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Check rate limit
    if (!checkRateLimit('subscribers', ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      const resetIn = getRateLimitReset('subscribers', ip, RATE_LIMIT_WINDOW);
      return errorResponse(
        'RATE_LIMITED',
        `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(resetIn / 60)} menit.`,
        429
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = createSubscriberSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.errors[0].message, 422);
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    // Idempotent behavior: return 200 with alreadySubscribed key instead of throwing error
    if (existing) {
      return successResponse({
        email: existing.email,
        alreadySubscribed: true,
      });
    }

    // Create subscriber
    const subscriber = await prisma.subscriber.create({
      data: { email: normalizedEmail },
    });

    // Record rate limit attempt
    recordAttempt('subscribers', ip, RATE_LIMIT_WINDOW);

    return successResponse(
      {
        email: subscriber.email,
        alreadySubscribed: false,
      },
      201
    );
  } catch (error) {
    console.error('POST /api/subscribers error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
