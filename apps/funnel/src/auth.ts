import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, db, sessions, users, verificationTokens } from "@pbh/db";
import { sendMagicLinkEmail } from "@/lib/auth-email";

/** How long a magic link stays valid, in seconds (30 minutes). */
export const MAGIC_LINK_TTL_SECONDS = 60 * 30;

/**
 * Auth.js (NextAuth v5) — passwordless magic-link sign-in for the funnel.
 *
 * Design decisions (see the auth scaffolding PR):
 *  - **Database sessions**, not JWT: revocable, supports "sign out everywhere"
 *    and automatic-logoff, and pairs with the audit_log — the defensible choice
 *    for a HIPAA-adjacent posture. Neon's HTTP driver keeps the per-request
 *    lookup cheap.
 *  - **Login-only**: accounts are created in the paid get-started flow. A magic
 *    link authenticates an existing account and never creates one — enforced in
 *    two places (see `adapter.createUser` below and `sendMagicLinkEmail`, which
 *    never emails an address without an account, avoiding enumeration).
 *  - **Branded, env-gated email**: sending goes through `@pbh/emails` + the same
 *    Resend path as the rest of the app, so with `RESEND_API_KEY` unset every
 *    send is a logged no-op and local dev still works (the sign-in URL is logged).
 */

// The adapter's table generic only allows plain text/varchar for `email`, but
// ours is Postgres `citext` (case-insensitive) — a custom column type it doesn't
// enumerate, though it reads/writes it as a string at runtime exactly the same.
// Assert to the adapter's own Postgres schema type (derived by instantiating its
// generic with our db, so it's dialect-correct) to satisfy the generic without
// weakening anything real.
type PgAdapterSchema = NonNullable<
  Parameters<typeof DrizzleAdapter<typeof db>>[1]
>;

const baseAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as unknown as PgAdapterSchema);

const adapter = {
  ...baseAdapter,
  // Refuse to auto-create an account from a magic link. This should never fire
  // (sendMagicLinkEmail doesn't email unknown addresses, so no token is ever
  // minted for one) — it's a hard backstop against a nameless user being
  // created if a token for an unknown email were somehow redeemed.
  createUser: async () => {
    throw new Error("SIGNUP_VIA_MAGIC_LINK_DISABLED");
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: "database",
    // 7-day sliding window; refreshed at most once a day on activity. Tighten
    // maxAge for a stricter idle-logoff policy if compliance asks.
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  providers: [
    Resend({
      id: "magic-link",
      name: "Email",
      // Unused at runtime — our sendVerificationRequest override does the send.
      // Kept non-empty so the provider constructs when RESEND_API_KEY is unset.
      apiKey: process.env.RESEND_API_KEY ?? "unused",
      from:
        process.env.EMAIL_FROM ??
        "Primary Brain Health <onboarding@resend.dev>",
      maxAge: MAGIC_LINK_TTL_SECONDS,
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLinkEmail(identifier, url, MAGIC_LINK_TTL_SECONDS / 60);
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      // Database strategy hands us the full adapter user; surface its id.
      session.user.id = user.id;
      return session;
    },
  },
});
