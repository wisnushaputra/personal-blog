import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { bigIntToString, formatDate, readingTime } from '@/lib/utils';
import { TagChip } from '@/components/TagChip';

const PAGE_SIZE = 6; // Number of posts per page

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

// Generate static params for all categories (optional, for static generation)
export async function generateStaticParams() {
  // Returning an empty array here means Next.js will not statically generate
  // these pages at build time. They will be dynamically rendered on demand.
  // This is a workaround for database connectivity issues during build.
  return [];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} — Kategori | Wisnu Blog`,
    description:
      category.description || `Artikel-artikel terkait kategori ${category.name} di Wisnu Blog.`,
    openGraph: {
      title: `${category.name} — Kategori | Wisnu Blog`,
      description:
        category.description || `Artikel-artikel terkait kategori ${category.name} di Wisnu Blog.`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const page = parseInt(searchParams.page || '1');
  const skip = (page - 1) * PAGE_SIZE;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, description: true },
  });

  if (!category) notFound();

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.post.count({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
      },
    }),
  ]);

  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Kategori: {category.name}
        </h1>
        {category.description && (
          <p className="mx-auto max-w-prose text-lg text-muted">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted">({totalPosts} artikel)</p>
      </header>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted">Belum ada artikel di kategori ini.</p>
          <Link href="/" className="mt-4 inline-block text-accent hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      ) : (
        <section className="mb-16 sm:mb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {post.category && (
                        <span className="inline-block rounded-full bg-highlight px-3 py-1 text-xs font-medium text-ink">
                          {post.category.name}
                        </span>
                      )}
                      {post.tags.map((postTag) => (
                        <TagChip
                          key={bigIntToString(postTag.tag.id)}
                          name={postTag.tag.name}
                          slug={postTag.tag.slug}
                        />
                      ))}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <Link
                href={`/category/${slug}?page=${Math.max(1, page - 1)}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  page === 1
                    ? 'pointer-events-none cursor-not-allowed text-muted'
                    : 'bg-accent text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-ink">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/category/${slug}?page=${Math.min(totalPages, page + 1)}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  page === totalPages
                    ? 'pointer-events-none cursor-not-allowed text-muted'
                    : 'bg-accent text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
