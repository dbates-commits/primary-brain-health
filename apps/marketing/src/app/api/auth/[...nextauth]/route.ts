import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { auditThrottledSignIn, consumeSignInAttempt } from "@/lib/rate-limit";
import { getClientIp, isValidEmail, normalizeEmail } from "@pbh/booking/server";

/**
 * Auth.js request handlers — mounts sign-in, magic-link callback, session, and
 * sign-out endpoints under /api/auth/*. All auth flows route through here.
 */
export const { GET } = handlers;

/**
 * Read the posted `email` without consuming the body Auth.js still has to read.
 *
 * `clone()` because the original stream has to survive for the real handler.
 * Auth.js itself only parses form bodies; the JSON branch exists so a caller
 * cannot dodge the throttle by changing the content type, and costs nothing.
 */
async function postedEmail(req: NextRequest): Promise<string | null> {
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body: unknown = await req.clone().json();
      const value = (body as Record<string, unknown> | null)?.email;
      return typeof value === "string" ? value : null;
    }
    const value = (await req.clone().formData()).get("email");
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

/**
 * The same throttle the login form applies, on Auth.js's own sign-in endpoint.
 *
 * `sendLoginLink` guards the server action, which is the only door our UI uses
 * — but it is not the only door. `POST /api/auth/signin/magic-link` (with a
 * csrfToken from `GET /api/auth/csrf`) reaches the identical `signIn` callback,
 * and its response distinguishes a registered address from an unregistered one
 * by where it redirects: `pages.verifyRequest` versus `pages.error`. Left
 * unguarded, the throttle that `docs/auth.md` records as the bound on account
 * enumeration would be bounding only the door nobody scripting this would use,
 * and the same endpoint would mailbomb a known address without limit.
 *
 * A refusal is a bare 429. Auth.js's redirect vocabulary is exactly the signal
 * being withheld, so the throttle answers in a different language rather than
 * picking one of its outcomes.
 *
 * An absent or malformed address is passed straight through, matching the
 * action: it never reaches the oracle, so it does not cost a slot. Auth.js
 * rejects it on its own without minting a token or sending mail.
 */
export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/signin")) {
    const raw = await postedEmail(req);
    const email = raw ? normalizeEmail(raw) : null;
    if (email && isValidEmail(email)) {
      const ip = getClientIp(req.headers);
      const attempt = await consumeSignInAttempt({ ip, email });
      if (!attempt.allowed) {
        await auditThrottledSignIn(ip, attempt.limit);
        return new Response("Too many sign-in attempts.\n", {
          status: 429,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }
  }

  return handlers.POST(req);
}
