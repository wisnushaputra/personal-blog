'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { bigIntToString, formatDate, readingTime } from '@/lib/utils';
import { TagChip } from '@/components/TagChip';
import { Search, Loader2 } from 'lucide-react';

interface Post {
  id: bigint;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  content: string;
  category: { name: string; slug: string } | null;
  tags: { tag: { id: bigint; name: string; slug: string } }[];
  publishedAt: Date | null;
  views: number;
}

const DEBOUNCE_DELAY = 300; // milliseconds
const PAGE_SIZE = 6;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&page=${currentPage}&limit=${PAGE_SIZE}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message || 'Search failed');
        }

        setResults(data.data.items);
        setTotalResults(data.data.total);
      } catch (err: any) {
        setError(err.message);
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, currentPage]);

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Optionally scroll to top of results section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Search Articles
        </h1>
        <p className="mx-auto max-w-prose text-lg text-muted">
          Find what you're looking for by typing keywords below.
        </p>
      </header>

      <section className="relative mb-16 sm:mb-24">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for articles..."
            className="w-full rounded-xl border border-border bg-surface py-3.5 pl-10 pr-4 text-lg text-ink placeholder-muted transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </section>

      {/* Search Results */}
      <section>
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="py-10 text-center">
            <p className="text-lg text-red-500">Error: {error}</p>
          </div>
        )}

        {!loading && !error && debouncedQuery && results.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted">No results found for "{debouncedQuery}".</p>
            <p className="mt-2 text-sm text-muted">
              Try searching for different keywords or checking your spelling.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post) => (
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
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {post.tags.map((postTag) => (
                          <TagChip
                            key={bigIntToString(postTag.tag.id)}
                            name={postTag.tag.name}
                            slug={postTag.tag.slug}
                          />
                        ))}
                      </div>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && debouncedQuery && results.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'pointer-events-none cursor-not-allowed text-muted'
                  : 'bg-accent text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-ink">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'pointer-events-none cursor-not-allowed text-muted'
                  : 'bg-accent text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
