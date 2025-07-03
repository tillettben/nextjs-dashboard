import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { db } from './drizzle/db';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) {
            if (process.env.NODE_ENV === 'development' || process.env.CI) {
              console.log(`No user found for email: ${email}`);
            }
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            if (process.env.NODE_ENV === 'development' || process.env.CI) {
              console.log(`Login successful for: ${email}`);
            }
            return user;
          }
          if (process.env.NODE_ENV === 'development' || process.env.CI) {
            console.log(`Password mismatch for: ${email}`);
          }
        }
        if (process.env.NODE_ENV === 'development' || process.env.CI) {
          console.log('Invalid credentials or validation failed');
        }
        return null;
      },
    }),
  ],
});
