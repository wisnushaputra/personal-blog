import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-surface sm:mt-24">
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-2 font-display font-semibold text-ink">Wisnu Blog</h3>
            <p className="text-sm text-muted">
              Berbagi catatan pengetahuan dan pengalaman di dunia teknologi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold text-ink">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted transition-colors hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted transition-colors hover:text-accent">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted transition-colors hover:text-accent">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="mb-4 font-semibold text-ink">Newsletter</h4>
            <p className="mb-3 text-sm text-muted">
              Dapatkan update artikel terbaru langsung ke email Anda.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
            <p>&copy; {currentYear} Wisnu Blog. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-accent">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-accent">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
