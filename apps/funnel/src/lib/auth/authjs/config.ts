/**
 * Auth.js (next-auth v5) configuration — the `/authjs` side of the provider
 * evaluation. Uses a Credentials provider (email + password) verified against
 * the existing Neon `users` table with the repo's scrypt helper, and a JWT
 * session so no adapter tables are needed for the spike. Magic-link email is
 * the intended production strategy but needs an email sender we don't have yet
 * (see docs/sow2/technical/auth-provider-eval.md), so credentials keep the
 * demo self-contained.
 *
 * The verified identity is handed to the shared `completeProviderLogin` (in the
 * sign-in action) so this route lands on the same assessment session as Clerk.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/authjs" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) {
          return null;
        }

        if (user.passwordHash) {
          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) {
            return null;
          }
        } else {
          // Pre-existing account created by the funnel signup flow, which never
          // collected a password. First Auth.js sign-in sets one, so subsequent
          // logins verify normally.
          await db
            .update(users)
            .set({ passwordHash: await hashPassword(password) })
            .where(eq(users.id, user.id));
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        };
      },
    }),
  ],
});
