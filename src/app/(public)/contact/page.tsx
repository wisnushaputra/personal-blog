import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kontak — Wisnu Blog',
  description: 'Hubungi Wisnu untuk pertanyaan, saran, atau kolaborasi.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Hubungi Saya
        </h1>
        <p className="text-lg text-muted">Ada pertanyaan, saran, atau ingin berkolaborasi?</p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-8">
        <p className="mb-6 text-ink">
          Anda dapat menghubungi saya langsung melalui email di{' '}
          <Link href="mailto:wisnu@example.com" className="text-accent hover:underline">
            wisnu@example.com
          </Link>
          .
        </p>

        {/* Placeholder Form */}
        <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
          Kirim Pesan (Form Placeholder)
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
              Nama Anda
            </label>
            <input
              type="text"
              id="name"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Nama lengkap Anda"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email Anda
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-ink">
              Subjek
            </label>
            <input
              type="text"
              id="subject"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Subjek pesan"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
              Pesan Anda
            </label>
            <textarea
              id="message"
              rows={5}
              className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Tulis pesan Anda di sini..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Kirim Pesan
          </button>
        </form>
      </section>
    </div>
  );
}
