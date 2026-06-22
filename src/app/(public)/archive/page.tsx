import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { bigIntToString, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Arsip Artikel — Wisnu Blog',
  description: 'Daftar semua artikel yang pernah dipublikasikan di Wisnu Blog.',
};

export const dynamic = 'force-dynamic'; // Ensure data is always fresh

export async function generateStaticParams() {
  // Returning an empty array here means Next.js will not statically generate
  // these pages at build time. They will be dynamically rendered on demand.
  // This is a workaround for database connectivity issues during build.
  return [];
}

export default async function ArchivePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  // Group posts by year
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.publishedAt || '').getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, typeof posts>
  );

  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="mx-auto max-w-prose px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Arsip Artikel
        </h1>
        <p className="text-lg text-muted">
          Jelajahi semua artikel di Wisnu Blog berdasarkan tahun.
        </p>
      </header>

      {years.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted">Belum ada artikel di arsip.</p>
          <Link href="/" className="mt-4 inline-block text-accent hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      ) : (
        <section className="space-y-12">
          {years.map((year) => (
            <div key={year}>
              <h2 className="mb-6 border-b border-border pb-2 font-display text-3xl font-semibold text-ink">
                {year}
              </h2>
              <ul className="space-y-4">
                {postsByYear[year].map((post) => (
                  <li key={bigIntToString(post.id)}>
                    <Link href={`/${post.slug}`} className="group block">
                      <h3 className="text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                        {post.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                        <time dateTime={post.publishedAt?.toISOString()}>
                          {formatDate(post.publishedAt)}
                        </time>
                        {post.category && (
                          <>
                            <span>·</span>
                            <span className="bg-highlight/20 inline-block rounded-full px-2 py-0.5 text-xs text-ink">
                              {post.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
