import { handlers } from "@/auth";

/**
 * Auth.js request handlers — mounts sign-in, magic-link callback, session, and
 * sign-out endpoints under /api/auth/*. All auth flows route through here.
 */
export const { GET, POST } = handlers;
