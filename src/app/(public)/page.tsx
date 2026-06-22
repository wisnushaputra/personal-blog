import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { bigIntToString, formatDate, readingTime } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // Ensure data is always fresh

export default async function HomePage() {
  // Fetch data for latest posts, popular posts, and categories in parallel
  const [latestPosts, popularPosts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 6, // FR-HOME-01: 6-10 latest articles
      include: {
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 5, // FR-HOME-02: 5 popular articles (all-time for MVP)
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-16 sm:mb-24">
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
            Selamat datang di Wisnu Blog
          </h1>
          <p className="max-w-prose text-lg text-muted">
            Tempat berbagi catatan pengetahuan dan pengalaman di dunia teknologi. Dari tutorial
            coding, best practices, hingga refleksi perjalanan developer.
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              href="/search"
              className="inline-flex items-center rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Explore Articles
            </Link>
            <Link
              href="#" // This should link to a newsletter subscribe page/modal
              className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-medium text-ink transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="mb-16 sm:mb-24">
        <h2 className="mb-8 font-display text-3xl font-semibold text-ink">Latest Articles</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <Link href={`/${post.slug}`} key={bigIntToString(post.id)}>
              <article className="block h-full rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent">
                <div className="flex h-full flex-col space-y-3">
                  {post.thumbnail && (
                    <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div>
                    {post.category && (
                      <span className="mb-2 inline-block rounded-full bg-highlight px-3 py-1 text-xs font-medium text-ink">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-display text-lg font-semibold text-ink">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 flex-grow text-sm text-muted">{post.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-muted">{formatDate(post.publishedAt)}</span>
                    <span className="text-xs text-muted">{readingTime(post.content || '')}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="mb-16 sm:mb-24">
        <h2 className="mb-8 font-display text-3xl font-semibold text-ink">Popular Articles</h2>
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <Link href={`/${post.slug}`} key={bigIntToString(post.id)}>
              <article className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="mb-2 font-display font-semibold text-ink">{post.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>📅 {formatDate(post.publishedAt)}</span>
                      <span>👁️ {post.views} views</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="mb-8 font-display text-3xl font-semibold text-ink">Explore Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={bigIntToString(category.id)}
              href={`/category/${category.slug}`}
              className="rounded-lg border border-border bg-surface px-6 py-4 text-center font-medium text-ink transition-colors hover:bg-highlight hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
