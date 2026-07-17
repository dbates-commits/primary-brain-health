import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db, users, writeAuditLog } from "@pbh/db";
import { MagicLinkEmail, renderEmail } from "@pbh/emails";
import { normalizeEmail } from "@pbh/booking/server";

/**
 * Send a passwordless sign-in email. Called by Auth.js's email provider via
 * `sendVerificationRequest` (see auth.ts). Mirrors the contract of
 * `lib/send-email.ts`:
 *
 *  - **Never throws.** Email is a side effect of the sign-in flow; a send
 *    failure must not surface as an auth error. Auth.js redirects to the
 *    "check your email" page regardless — which is also what makes this
 *    non-enumerating (see below).
 *  - **Env-gated.** With `RESEND_API_KEY` unset (local dev, preview without
 *    keys) the send is a logged no-op — and the dev sign-in URL is logged so
 *    you can still complete sign-in locally.
 *  - **Login-only + non-enumerating.** An address with no account gets no
 *    email, but the caller still shows "check your email", so the response is
 *    identical whether or not an account exists.
 */
const DEFAULT_FROM = "Primary Brain Health <onboarding@resend.dev>";

export async function sendMagicLinkEmail(
  rawEmail: string,
  url: string,
  expiresMinutes: number,
): Promise<void> {
  const email = normalizeEmail(rawEmail);

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Login-only: never reveal whether an address is registered. No account →
  // silently send nothing; the caller still shows the check-your-email page.
  if (!user) {
    console.log(
      "[auth] magic-link requested for an unregistered email — no send",
    );
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[auth] RESEND_API_KEY not set — magic-link email skipped.\n` +
        `[auth] Dev sign-in URL for ${user.email}:\n${url}`,
    );
    return;
  }

  try {
    const { html, text } = await renderEmail(
      MagicLinkEmail({
        firstName: user.firstName,
        magicLinkUrl: url,
        expiresMinutes,
      }),
    );
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to: user.email,
      subject: "Your Primary Brain Health sign-in link",
      html,
      text,
    });
    if (error) {
      console.error("[auth] magic-link send failed:", error);
      return;
    }

    // Best-effort audit — a logging failure must not break an already-sent link.
    try {
      await writeAuditLog({
        eventType: "magic_link_sent",
        userId: user.id,
        metadata: { resendId: data?.id ?? null },
      });
    } catch (err) {
      console.error("[auth] audit write for magic_link_sent failed:", err);
    }
  } catch (err) {
    console.error("[auth] magic-link send failed:", err);
  }
}
