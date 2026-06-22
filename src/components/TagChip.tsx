import Link from 'next/link';

interface TagChipProps {
  name: string;
  slug: string;
}

export function TagChip({ name, slug }: TagChipProps) {
  return (
    <Link
      href={`/tag/${slug}`}
      className="inline-block rounded border border-border bg-surface px-2.5 py-0.5 text-xs text-muted no-underline transition-colors hover:border-accent hover:text-accent"
    >
      {name}
    </Link>
  );
}
