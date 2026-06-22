import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wisnu Blog',
  description: 'Catatan teknologi dan pengalaman dari Wisnu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
