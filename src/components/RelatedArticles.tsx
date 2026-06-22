import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface RelatedArticlesProps {
  currentPostId: bigint;
  categoryId: bigint | null;
  tagIds: bigint[];
}

export async function RelatedArticles({ currentPostId, categoryId, tagIds }: RelatedArticlesProps) {
  // Fetch related articles by same category or shared tags (FR-ART-05: min 3)
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      status: 'PUBLISHED',
      OR: [
        ...(categoryId ? [{ categoryId }] : []),
        ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      thumbnail: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  if (relatedPosts.length === 0) return null;

  return (
    <div>
      <h3 className="mb-6 text-xl font-semibold text-ink">Artikel Terkait</h3>
      <div className="grid gap-5 sm:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.id.toString()}
            href={`/${post.slug}`}
            className="group block rounded-lg border border-border bg-surface p-4 no-underline transition-colors hover:border-accent"
          >
            {post.thumbnail && (
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )}
            {post.category && (
              <span className="mb-2 inline-block rounded-full bg-highlight px-2.5 py-0.5 text-[10px] font-medium text-ink">
                {post.category.name}
              </span>
            )}
            <h4 className="mb-1 line-clamp-2 font-display text-sm font-semibold text-ink transition-colors group-hover:text-accent">
              {post.title}
            </h4>
            <p className="mb-2 line-clamp-2 text-xs text-muted">{post.excerpt}</p>
            <time className="text-[10px] text-muted">{formatDate(post.publishedAt)}</time>
          </Link>
        ))}
      </div>
    </div>
  );
}
