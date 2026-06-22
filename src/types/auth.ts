// Types untuk Next-Auth
import type { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
  }

  interface Session {
    user?: {
      id?: string;
      role?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
