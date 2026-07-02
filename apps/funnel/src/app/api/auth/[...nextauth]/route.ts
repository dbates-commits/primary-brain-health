/** Auth.js (next-auth v5) route handler — mounts the provider's sign-in,
 * callback, session, and CSRF endpoints under /api/auth/*. */
import { handlers } from "@/lib/auth/authjs/config";

export const { GET, POST } = handlers;
