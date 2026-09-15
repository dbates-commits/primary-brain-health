import "server-only";

/**
 * Whether the internal pages are switched off on this deployment.
 *
 * One variable for all of them — the journey map, the services list and the
 * email previews. They were three separate flags, which meant production could
 * serve one tab and 404 the other two: a reviewer who typed the password got a
 * nav bar of dead links.
 *
 * Not `/internal/modals`: that is the editing surface the Modals collection's
 * `ui.router` sends an editor to, and editors work in the production admin. It
 * keeps the password, and nothing else on it is gated — see its own page.
 *
 * Off in production unless `INTERNAL_PAGES_ENABLED=1`. Everywhere else they are
 * on, behind the password the proxy asks for.
 */
export function internalPagesHidden(): boolean {
  return process.env.VERCEL_ENV === "production" && process.env.INTERNAL_PAGES_ENABLED !== "1";
}
