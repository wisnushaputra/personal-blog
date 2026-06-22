import type { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Login - Wisnu Blog',
  description: 'Area login untuk admin Wisnu Blog',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
