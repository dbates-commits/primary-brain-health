import type { DefaultSession } from "next-auth";

/**
 * Expose the authenticated user's id on the session. With the database session
 * strategy the `session` callback receives the full adapter user, and we copy
 * its id onto `session.user` so server components and actions can authorize by
 * `session.user.id` (replacing the old unsigned `pbh_assessment_uid` cookie).
 *
 * `firstName` rides along for the header's account menu, which renders in the
 * browser and greets the customer by name. It is the only user column besides
 * the id that reaches the client — see the note on the `session` callback in
 * `src/auth.ts` before adding a third.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
    } & DefaultSession["user"];
  }
}
