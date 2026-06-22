import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Saya — Wisnu Blog',
  description: 'Informasi tentang Wisnu, penulis blog ini.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Tentang Saya
        </h1>
        <p className="text-lg text-muted">Beberapa hal tentang penulis blog ini.</p>
      </header>

      <section className="prose prose-lg mx-auto text-ink">
        <p>
          Halo! Saya Wisnu, seorang entusiast teknologi yang senang berbagi pengetahuan dan
          pengalaman. Blog ini adalah wadah saya untuk mendokumentasikan perjalanan saya di dunia
          teknologi, mulai dari coding, pengembangan web, hingga pemikiran tentang industri.
        </p>
        <p>
          Saya percaya bahwa belajar adalah proses yang berkelanjutan, dan berbagi apa yang saya
          pelajari adalah cara terbaik untuk memperdalam pemahaman saya sendiri dan membantu orang
          lain. Anda akan menemukan berbagai artikel di sini, mulai dari tutorial praktis, ulasan
          teknologi, hingga opini pribadi.
        </p>
        <p>
          Terima kasih sudah berkunjung! Semoga Anda menemukan sesuatu yang bermanfaat dan
          menginspirasi di sini. Jangan ragu untuk meninggalkan komentar atau menghubungi saya jika
          Anda punya pertanyaan atau ingin berdiskusi.
        </p>
        <h2 className="mb-4 mt-8 font-display text-2xl font-semibold text-ink">Minat & Keahlian</h2>
        <ul>
          <li>Web Development (Next.js, React, Node.js)</li>
          <li>Cloud & DevOps (Docker, Kubernetes, AWS/GCP)</li>
          <li>Data Science & Machine Learning (Python, TensorFlow)</li>
          <li>Penulisan Teknis & Edukasi</li>
        </ul>
        <h2 className="mb-4 mt-8 font-display text-2xl font-semibold text-ink">Hubungi Saya</h2>
        <p>
          Anda bisa menghubungi saya melalui email di{' '}
          <a href="mailto:wisnu@example.com" className="text-accent hover:underline">
            wisnu@example.com
          </a>{' '}
          atau kunjungi profil LinkedIn saya.
        </p>
      </section>
    </div>
  );
}
