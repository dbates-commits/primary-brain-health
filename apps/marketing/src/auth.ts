import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Auth0 from "next-auth/providers/auth0";
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
import { AUTH0_ENABLED } from "@/lib/auth0-enabled";
import { auth0SignInAddress } from "@/lib/auth0-gate";
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
 *
 * Since Sep 2026 there is a second provider, Auth0 — see `AUTH0_ENABLED` below
 * and the "Auth0" section of `docs/auth.md`. It authenticates; it does not own
 * the session. Everything above still holds.
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
    // Refuse to auto-create an account from any sign-in. This should never fire
    // — the `signIn` callback below rejects an unknown address on both paths
    // before the adapter is reached, and sendMagicLinkEmail never emails one —
    // it's a hard backstop against a nameless user being created if a magic-link
    // token for an unknown email were somehow redeemed, or if an Auth0 identity
    // arrived for an address with no PBH account.
    createUser: async () => {
      throw new Error("SIGNUP_VIA_SIGNIN_DISABLED");
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
    // Registered conditionally rather than with empty-string fallbacks like the
    // Resend provider below: an OAuth provider missing its issuer fails Auth.js's
    // `assertConfig` on *every* request, which would take the magic link down
    // too wherever Auth0 credentials aren't set. Unset means the app behaves
    // exactly as it did before Auth0 existed.
    ...(AUTH0_ENABLED
      ? [
          Auth0({
            issuer: process.env.AUTH0_ISSUER,
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            // Attach an Auth0 identity to the PBH `users` row the booking flow
            // already created for that address, instead of minting a second
            // user for the same person. "Dangerous" is Auth.js warning that a
            // provider which lies about `email_verified` could take over an
            // account — which is why the `signIn` callback below refuses any
            // Auth0 profile that isn't verified, before this ever applies.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
     * The resulting AccessDenied is **not** swallowed any more: since Aug 2026
     * the form tells the caller that the address has no account (Figma
     * `1988:10890`), which makes sign-in an enumeration oracle by design. What
     * bounds it is the throttle in `lib/rate-limit.ts`, applied on both doors
     * into this callback — the login server action and the Auth.js sign-in
     * route. See the disclosure note in `docs/auth.md` before widening either.
     */
    async signIn({ user, account, profile, email }) {
      // Auth0 sign-in. The same login-only rule as the magic link, and for the
      // same reason — accounts are born in the booking flow — but it has to be
      // checked here explicitly: the `email.verificationRequest` guard below
      // waves every non-email provider straight through.
      //
      // Refusing here also stops the account being created at all: Auth.js runs
      // this callback before it hands the profile to the adapter, so a rejection
      // never reaches `createUser` (which would throw) or `linkAccount`.
      if (account?.provider === "auth0") {
        // Refuses anything without a verified address — the check that makes
        // `allowDangerousEmailAccountLinking` safe. Tested in
        // `lib/auth0-gate.node.test.ts`.
        const address = auth0SignInAddress(profile, user.email);
        if (!address) {
          return false;
        }
        return (await findAuthUserByEmail(address)) !== null;
      }

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
      // Return a deliberately minimal session rather than passing through what
      // the adapter handed us.
      //
      // With the database strategy Auth.js merges the whole `sessions` row and
      // the whole `users` row into what `/api/auth/session` serves. That
      // exposed two things it should not:
      //
      //  - `sessionToken` — the session credential itself. It lives in an
      //    httpOnly cookie precisely so page scripts cannot read it, and then
      //    this endpoint handed it back to any script that could fetch. That
      //    turns any XSS into full session theft.
      //  - Every user column: date of birth, gender, ZIP, phone, and the Linus
      //    participant id. None of it is needed to render a page, and shipping
      //    it to the browser is at odds with keeping this tier PHI-light.
      //
      // `user.id` is what every route reads (see `session?.user?.id` in the
      // assessments, welcome and login routes). `firstName` is the one addition
      // to that floor: the header greets the signed-in customer by name
      // (Figma 1917:7795), and the menu is rendered client-side, so the name
      // has to reach the browser somehow. It is added one field at a time and
      // on purpose — do not widen this to the adapter's user object, and think
      // twice before adding anything from the clinical columns.
      // The Drizzle adapter hands the whole `users` row to this callback, so
      // `firstName` is there at runtime. `AdapterUser` is Auth.js's own fixed
      // shape and knows nothing about our columns, hence the assertion — the
      // same reason the schema is asserted above.
      const { firstName } = user as typeof user & { firstName: string };

      return {
        expires: session.expires,
        user: { id: user.id, firstName },
      };
    },
  },
  events: {
    /**
     * Audit every successful sign-in. `createSessionForUser` writes its own
     * `login` entry for the programmatic path; this covers magic-link sign-ins,
     * which otherwise produced only a `magic_link_sent` and no access record.
     */
    async signIn({ user, account }) {
      if (!user.id) {
        return;
      }
      try {
        await writeAuditLog({
          eventType: "login",
          userId: user.id,
          metadata: { method: account?.provider ?? "magic-link" },
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
