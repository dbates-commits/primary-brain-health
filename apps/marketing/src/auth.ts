import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Auth0 from "next-auth/providers/auth0";
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
import { markEmailVerified } from "@pbh/booking/server";
import { findAuthUserByEmail } from "@/lib/auth-user";

/**
 * Session and link lifetimes, set from PBH's security review (Bill, 2026-07-22).
 *
 * HIPAA prescribes no specific duration — it requires an automatic logoff
 * control proportionate to the risk. The signed-in area reaches the Linus
 * report, so these are deliberately short.
 */

/** Inactivity timeout. Idle this long and the next request is unauthenticated. */
export const IDLE_SESSION_MAX_SECONDS = 60 * 15;

/**
 * Absolute cap on a session's total age, however active it has been. Auth.js
 * only implements a sliding window, so this is enforced by hand in
 * `getSessionAndUser` below.
 */
export const ABSOLUTE_SESSION_MAX_SECONDS = 60 * 60 * 8;

/**
 * Auth.js (NextAuth v5) — session and identity for the app, with Auth0 as the
 * single sign-in provider.
 *
 * Design decisions:
 *  - **Database sessions**, not JWT: revocable, supports "sign out everywhere"
 *    and automatic-logoff, and pairs with the audit_log — the defensible choice
 *    for a HIPAA-adjacent posture. Neon's HTTP driver keeps the per-request
 *    lookup cheap. It is also what lets the booking flow mint a session itself
 *    after a payment verifies; Auth0 authenticates, it does not own the session.
 *  - **Login-only**: accounts are created in the marketing booking flow. Signing
 *    in authenticates an existing account and never creates one — enforced in
 *    the `signIn` callback and again in `adapter.createUser`.
 *  - **Auth0 is the only door.** Passwordless magic link was removed in Sep 2026
 *    once Auth0 also took over verifying the address at signup; see the "Auth0"
 *    section of `docs/auth.md` for what moved with it, notably the account-
 *    enumeration bound.
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
    // Refuse to auto-create an account from a sign-in. This should never fire
    // — the `signIn` callback below rejects an unknown address before the
    // adapter is reached — it's a hard backstop against a nameless user being
    // created if an Auth0 identity arrived for an address with no PBH account.
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
    // No `verifyRequest`: that page existed for the magic link's "check your
    // email" state. Auth0 shows its own code screen, on its own domain.
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Registered conditionally, not with empty-string fallbacks: an OAuth
    // provider missing its issuer fails Auth.js's `assertConfig` on *every*
    // request. With `AUTH0_*` unset there is now no way to sign in at all —
    // which is the honest outcome, since there is no second provider left.
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
  ],
  callbacks: {
    /**
     * Login-only gate: an address with no PBH account cannot sign in, because
     * accounts are born in the booking flow.
     *
     * Refusing here also stops the account being created at all — Auth.js runs
     * this callback before it hands the profile to the adapter, so a rejection
     * never reaches `createUser` (which throws) or `linkAccount`.
     */
    async signIn({ user, profile }) {
      // Refuses anything without a verified address — the check that makes
      // `allowDangerousEmailAccountLinking` safe. Tested in
      // `lib/auth0-gate.node.test.ts`.
      const address = auth0SignInAddress(profile, user.email);
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
     * `login` entry for the programmatic path; this covers Auth0 sign-ins,
     * which would otherwise leave no access record at all.
     */
    async signIn({ user, account }) {
      if (!user.id) {
        return;
      }
      try {
        await writeAuditLog({
          eventType: "login",
          userId: user.id,
          metadata: { method: account?.provider ?? "unknown" },
        });
      } catch (err) {
        console.error("[auth] audit write for login failed:", err);
      }

      // Auth0 emailed this customer a code and they entered it, so the address
      // is proven — which is the whole job the `/booking/confirm` link used to
      // do at this point in the booking flow. Stamping it here is what lets
      // `resolveBookingResumeState` move them past the confirm step.
      //
      // Fires on every Auth0 sign-in, not just the first; `markEmailVerified`
      // is idempotent and only sends the welcome email on the transition.
      // Best-effort: a failure here must not fail a sign-in that has already
      // succeeded — it costs the customer a re-verify, not their session.
      if (account?.provider === "auth0") {
        try {
          await markEmailVerified(user.id);
        } catch (err) {
          console.error("[auth] stamping email_verified failed:", err);
        }
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
