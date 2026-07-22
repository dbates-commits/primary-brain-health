import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  accounts,
  db,
  getDb,
  sessions,
  users,
  verificationTokens,
  writeAuditLog,
} from "@pbh/db";
import { sendMagicLinkEmail } from "@/lib/auth-email";
import { findAuthUserByEmail } from "@/lib/auth-user";

/**
 * Session and link lifetimes, set from PBH's security review (Bill, 2026-07-22).
 *
 * HIPAA prescribes no specific duration — it requires an automatic logoff
 * control proportionate to the risk. The signed-in area reaches the Linus
 * report, so these are deliberately short.
 */

/** Magic link validity. Single-use as well: Auth.js deletes the token on redeem. */
export const MAGIC_LINK_TTL_SECONDS = 60 * 15;

/** Inactivity timeout. Idle this long and the next request is unauthenticated. */
export const IDLE_SESSION_MAX_SECONDS = 60 * 15;

/**
 * Absolute cap on a session's total age, however active it has been. Auth.js
 * only implements a sliding window, so this is enforced by hand in
 * `getSessionAndUser` below.
 */
export const ABSOLUTE_SESSION_MAX_SECONDS = 60 * 60 * 8;

/**
 * Auth.js (NextAuth v5) — passwordless magic-link sign-in for the app.
 *
 * Design decisions (see the auth scaffolding PR):
 *  - **Database sessions**, not JWT: revocable, supports "sign out everywhere"
 *    and automatic-logoff, and pairs with the audit_log — the defensible choice
 *    for a HIPAA-adjacent posture. Neon's HTTP driver keeps the per-request
 *    lookup cheap.
 *  - **Login-only**: accounts are created in the marketing booking flow. A magic
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

function buildAdapter(): Adapter {
  // `getDb()`, not the exported `db` Proxy: DrizzleAdapter picks its dialect via
  // drizzle's `is()`, which walks the prototype chain — the Proxy's plain-object
  // target fails every check and the adapter throws "Unsupported database type".
  const base = DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  } as unknown as PgAdapterSchema);

  return {
    ...base,
    // Refuse to auto-create an account from a magic link. This should never fire
    // (sendMagicLinkEmail doesn't email unknown addresses, so no token is ever
    // minted for one) — it's a hard backstop against a nameless user being
    // created if a token for an unknown email were somehow redeemed.
    createUser: async () => {
      throw new Error("SIGNUP_VIA_MAGIC_LINK_DISABLED");
    },

    /**
     * Enforce the absolute session cap on top of Auth.js's sliding window.
     *
     * `session.maxAge` only ever moves `expires` forward, so a session kept
     * warm by activity would never end. Here we also reject one whose
     * `createdAt` is older than the cap, and delete the row on the way out so
     * the revocation is real rather than merely unreported — the point of
     * database sessions.
     *
     * Done at the adapter rather than in a callback because returning null here
     * is what makes `auth()` report no session at all; a callback runs too late
     * to undo the lookup.
     */
    getSessionAndUser: async (sessionToken: string) => {
      const result = await base.getSessionAndUser!(sessionToken);
      if (!result) {
        return null;
      }

      const [row] = await getDb()
        .select({ createdAt: sessions.createdAt })
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .limit(1);

      const age = row ? Date.now() - row.createdAt.getTime() : 0;
      if (age > ABSOLUTE_SESSION_MAX_SECONDS * 1000) {
        await getDb()
          .delete(sessions)
          .where(eq(sessions.sessionToken, sessionToken));
        return null;
      }

      return result;
    },
  };
}

/**
 * Lazily-built adapter, mirroring the `db` Proxy in `@pbh/db`: constructing it
 * eagerly would call `getDb()` at module scope, and this module is imported
 * during `next build`'s page-data collection — which would make the build
 * require `DATABASE_URL`. Auth.js probes the adapter with `in` as well as
 * property reads (`assertConfig` checks its required methods), so both traps
 * have to resolve through to the real object.
 */
let resolved: Adapter | null = null;

function resolveAdapter(): Adapter {
  if (!resolved) {
    resolved = buildAdapter();
  }
  return resolved;
}

const adapter = new Proxy({} as Adapter, {
  get(_target, prop) {
    const real = resolveAdapter();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
  has(_target, prop) {
    return prop in resolveAdapter();
  },
  ownKeys() {
    return Reflect.ownKeys(resolveAdapter());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(resolveAdapter(), prop);
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: "database",
    // Inactivity timeout, not a total lifetime: Auth.js slides `expires`
    // forward on activity. `updateAge: 0` makes it slide on *every* request —
    // with the default (24h) the deadline would only be refreshed once a day,
    // so an active user would be logged out mid-session.
    maxAge: IDLE_SESSION_MAX_SECONDS,
    updateAge: 0,
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
    /**
     * Login-only gate. Auth.js mints the `verification_tokens` row and calls
     * `sendVerificationRequest` in the same `Promise.all`, so refusing inside
     * the send would still leave a token row behind for every unknown address.
     * Rejecting here runs first and stops the token being created at all.
     *
     * `requestMagicLink` swallows the resulting AccessDenied and shows the same
     * check-your-email page either way, so this stays non-enumerating.
     */
    async signIn({ user, email }) {
      if (!email?.verificationRequest) {
        return true;
      }
      const address = user.email;
      if (!address) {
        return false;
      }
      return (await findAuthUserByEmail(address)) !== null;
    },
    session({ session, user }) {
      // Database strategy hands us the full adapter user; surface its id.
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    /**
     * Audit every successful sign-in. `createSessionForUser` writes its own
     * `login` entry for the programmatic path; this covers magic-link sign-ins,
     * which otherwise produced only a `magic_link_sent` and no access record.
     */
    async signIn({ user }) {
      if (!user.id) {
        return;
      }
      try {
        await writeAuditLog({
          eventType: "login",
          userId: user.id,
          metadata: { method: "magic-link" },
        });
      } catch (err) {
        console.error("[auth] audit write for login failed:", err);
      }
    },
    /**
     * Audit sign-outs that go through Auth.js's own `/api/auth/signout`
     * endpoint. The in-app Sign out button calls `destroyCurrentSession`, which
     * audits itself — this covers the endpoint, so neither path is silent.
     */
    async signOut(message) {
      const userId =
        "session" in message ? message.session?.userId : message.token?.sub;
      if (!userId) {
        return;
      }
      try {
        await writeAuditLog({ eventType: "logout", userId });
      } catch (err) {
        console.error("[auth] audit write for logout failed:", err);
      }
    },
  },
});
