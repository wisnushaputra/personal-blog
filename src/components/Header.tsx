import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-container px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="font-display text-xl font-semibold text-ink transition-colors hover:text-accent"
          >
            Wisnu Blog
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm text-ink transition-colors hover:text-accent">
              Home
            </Link>
            <Link href="/search" className="text-sm text-ink transition-colors hover:text-accent">
              Search
            </Link>
            <Link href="/about" className="text-sm text-ink transition-colors hover:text-accent">
              About
            </Link>
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
