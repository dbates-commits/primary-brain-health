import type { DefaultSession } from "next-auth";

/**
 * Expose the authenticated user's id on the session. With the database session
 * strategy the `session` callback receives the full adapter user, and we copy
 * its id onto `session.user` so server components and actions can authorize by
 * `session.user.id` (replacing the old unsigned `pbh_assessment_uid` cookie).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
