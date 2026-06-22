import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdminAuth } from '@/lib/apiAuth';

// GET /api/stats - Dashboard statistics (admin only)
export async function GET() {
  try {
    // Check authentication
    const { error: authError } = await requireAdminAuth();
    if (authError) return authError;

    // Fetch all statistics in parallel
    const [totalPosts, totalViews, totalSubscribers, totalComments, pendingComments, popularPosts] =
      await Promise.all([
        // Total published posts
        prisma.post.count({
          where: { status: 'PUBLISHED' },
        }),

        // Total views across all posts
        prisma.post.aggregate({
          _sum: { views: true },
          where: { status: 'PUBLISHED' },
        }),

        // Total subscribers
        prisma.subscriber.count(),

        // Total comments (all statuses)
        prisma.comment.count(),

        // Total pending comments
        prisma.comment.count({
          where: { status: 'PENDING' },
        }),

        // Top 5 most viewed published posts
        prisma.post.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { views: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            views: true,
          },
        }),
      ]);

    // Transform response
    const stats = {
      totalPosts,
      totalViews: totalViews._sum?.views || 0,
      totalSubscribers,
      totalComments,
      pendingComments,
      popularPosts: popularPosts.map((post) => ({
        id: post.id.toString(),
        title: post.title,
        views: post.views,
      })),
    };

    return successResponse(stats);
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan server', 500);
  }
}
