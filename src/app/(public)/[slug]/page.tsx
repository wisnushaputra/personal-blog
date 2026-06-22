import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, readingTime } from '@/lib/utils';
import { ShareButtons } from '@/components/ShareButtons';
import { CommentSection } from '@/components/CommentSection';
import { RelatedArticles } from '@/components/RelatedArticles';
import { TagChip } from '@/components/TagChip';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, excerpt: true, thumbnail: true },
  });

  if (!post) return { title: 'Article Not Found' };

  return {
    title: `${post.title} — Wisnu Blog`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.thumbnail ? [post.thumbnail] : undefined,
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      comments: {
        where: { status: 'APPROVED', parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          replies: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!post) notFound();

  // Increment view count (fire and forget)
  prisma.post
    .update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
    .catch(console.error);

  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://wisnublog.com'}/${post.slug}`;

  return (
    <article className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
      {/* Article Header */}
      <header className="mx-auto mb-10 max-w-prose">
        {/* Category & Tags */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {post.category && (
            <Link
              href={`/category/${post.category.slug}`}
              className="inline-block rounded-full bg-highlight px-3 py-1 text-xs font-medium text-ink no-underline transition-opacity hover:opacity-80"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags.map((pt) => (
            <TagChip key={pt.tag.id.toString()} name={pt.tag.name} slug={pt.tag.slug} />
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-ink">{post.author.name}</span>
          </div>
          <span>·</span>
          <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span>·</span>
          <span>{readingTime(post.content)}</span>
          <span>·</span>
          <span>{post.views} views</span>
        </div>
      </header>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="relative mx-auto mb-12 h-64 max-w-4xl overflow-hidden rounded-xl sm:h-80 lg:h-96">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
          />
        </div>
      )}

      {/* Article Body */}
      <div
        className="prose prose-lg mx-auto max-w-prose text-ink
          [&_a]:text-accent [&_a]:underline [&_a]:hover:no-underline [&_blockquote]:rounded-r-lg
          [&_blockquote]:border-l-4 [&_blockquote]:border-highlight [&_blockquote]:bg-surface [&_blockquote]:py-3
          [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted
          [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5
          [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm
          [&_code]:text-accent [&_h2]:mb-4 [&_h2]:mt-12
          [&_h2]:font-display [&_h2]:text-ink
          [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-ink [&_hr]:my-8 [&_hr]:border-border [&_img]:mx-auto [&_img]:rounded-lg
          [&_li]:mb-2 [&_li]:text-ink [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_p]:leading-relaxed
          [&_p]:text-ink [&_pre]:mb-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface
          [&_pre]:p-4 [&_pre_code]:bg-transparent
          [&_pre_code]:p-0 [&_table]:w-full
          [&_table]:border-collapse [&_td]:border
          [&_td]:border-border [&_td]:px-3
          [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left
          [&_th]:font-semibold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share Buttons */}
      <div className="mx-auto mt-12 max-w-prose border-t border-border pt-8">
        <h3 className="mb-4 text-lg font-semibold text-ink">Bagikan Artikel</h3>
        <ShareButtons url={articleUrl} title={post.title} />
      </div>

      {/* Related Articles */}
      <div className="mx-auto mt-12 max-w-prose border-t border-border pt-8">
        <RelatedArticles
          currentPostId={post.id}
          categoryId={post.category?.id || null}
          tagIds={post.tags.map((pt) => pt.tag.id)}
        />
      </div>

      {/* Comments Section */}
      <div className="mx-auto mt-12 max-w-prose border-t border-border pt-8">
        <CommentSection
          postId={post.id.toString()}
          comments={post.comments.map((c) => ({
            id: c.id.toString(),
            name: c.name,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            replies: c.replies.map((r) => ({
              id: r.id.toString(),
              name: r.name,
              content: r.content,
              createdAt: r.createdAt.toISOString(),
            })),
          }))}
        />
      </div>
    </article>
  );
}
