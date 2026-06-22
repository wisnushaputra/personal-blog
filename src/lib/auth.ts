import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, recordAttempt, resetRateLimit, getRateLimitReset } from './rateLimit';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const email = credentials.email.toLowerCase().trim();

        // Rate limiting: maks 5 percobaan gagal per 15 menit
        if (!checkRateLimit('login', email)) {
          const resetIn = getRateLimitReset('login', email);
          throw new Error(
            `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(resetIn / 60)} menit.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          recordAttempt('login', email);
          throw new Error('Email atau password salah');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          recordAttempt('login', email);
          throw new Error('Email atau password salah');
        }

        // Login berhasil — reset rate limit counter
        resetRateLimit('login', email);

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
