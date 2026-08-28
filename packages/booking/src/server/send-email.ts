/**
 * Transactional email sends for the booking flow, built on Resend + `@pbh/emails`.
 *
 * Env-gated: when `RESEND_API_KEY` is unset (local dev, preview without keys)
 * every send is a logged no-op, so the flow works end-to-end with no email
 * setup. Senders NEVER throw — email is a side effect of flows (signup,
 * payment, enrollment) that must not fail because a send did. Callers should
 * `await` them anyway: on Vercel, work left un-awaited after the response is
 * frozen with the function.
 *
 * PHI rule: emails carry no assessment results or report content — only links
 * back to the site or out to the Linus Engagement App.
 */

import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db, users, writeAuditLog } from "@pbh/db";
import {
  AccountDeactivatedEmail,
  AssessmentReadyEmail,
  ConfirmEmailEmail,
  PaymentFailedEmail,
  PaymentReceiptEmail,
  PaymentRefundedEmail,
  renderEmail,
  siteBaseUrl,
  WelcomeEmail,
} from "@pbh/emails";

/**
 * Sender identity. Until the PBH domain is verified in Resend, the fallback
 * `onboarding@resend.dev` works for dev sends to the Resend account's own
 * email address; production sets EMAIL_FROM once the domain is verified.
 */
const DEFAULT_FROM = "Primary Brain Health <onboarding@resend.dev>";

/**
 * Where a paid customer actually goes: the Linus Engagement App, which owns
 * login and the assessments. Unset falls back to our own welcome screen, which
 * says the link is coming by email — see `EngagementAppCta`.
 */
function assessmentsUrl(): string {
  // `||`, not `??`: .env.example ships this var as an empty string, and every
  // Vercel scope that hasn't been given a real URL yet holds one too. `??` only
  // catches undefined, so an empty value would sail through and render a CTA
  // with no href at all.
  return process.env.NEXT_PUBLIC_ENGAGEMENT_APP_URL || `${siteBaseUrl()}/welcome`;
}

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" | "no-user" | "send-failed" };

/** Recipient fields every template needs. */
interface Recipient {
  email: string;
  firstName: string;
}

/**
 * Render + send one email through Resend, with the env gate, recipient
 * lookup, audit write, and never-throw contract in one place. `template`
 * names the email in logs and the audit trail (e.g. "welcome"). The env gate
 * runs before the recipient lookup so an unconfigured environment never even
 * queries the DB.
 */
async function sendTemplate(
  template: string,
  userId: string,
  subject: string,
  buildElement: (recipient: Recipient) => React.ReactElement,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set — skipped "${template}" for user ${userId}`,
    );
    return { sent: false, reason: "not-configured" };
  }

  const recipient = await loadRecipient(userId);
  if (!recipient) {
    return { sent: false, reason: "no-user" };
  }

  try {
    const { html, text } = await renderEmail(buildElement(recipient));
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to: recipient.email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`[email] send "${template}" failed:`, error);
      return { sent: false, reason: "send-failed" };
    }

    // The audit row is best-effort too — a logging failure must not turn an
    // already-delivered email into a caller-visible error.
    try {
      await writeAuditLog({
        eventType: "email_sent",
        userId,
        metadata: { template, resendId: data?.id ?? null },
      });
    } catch (err) {
      console.error(`[email] audit write for "${template}" failed:`, err);
    }
    return { sent: true };
  } catch (err) {
    console.error(`[email] send "${template}" failed:`, err);
    return { sent: false, reason: "send-failed" };
  }
}

/** Load the recipient fields for a send; null (logged) when the user is gone. */
async function loadRecipient(userId: string): Promise<Recipient | null> {
  const [user] = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    console.error(`[email] no user ${userId} — skipped send`);
    return null;
  }
  return user;
}

/**
 * Signup completed → confirm the address before the flow can continue.
 *
 * Builds the link from the raw token (the DB stores only its hash) and, when
 * Resend is unconfigured, logs the URL so local dev can still complete the flow
 * — the same affordance the magic-link email has. That log is the only place
 * the raw token appears outside the recipient's inbox.
 */
export async function sendConfirmEmail(
  userId: string,
  rawToken: string,
): Promise<SendEmailResult> {
  const confirmUrl = `${siteBaseUrl()}/booking/confirm?token=${encodeURIComponent(rawToken)}`;

  const result = process.env.RESEND_API_KEY
    ? await sendTemplate(
        "confirm-email",
        userId,
        "Confirm your email to continue",
        () => ConfirmEmailEmail({ confirmUrl }),
      )
    : ({ sent: false, reason: "not-configured" } as const);

  // Outside production, print the link whenever it did not reach an inbox — not
  // only when Resend is unconfigured. A sandbox Resend key refuses every
  // recipient except the account owner's own address, so without this a
  // developer testing with any other address hits a blocking confirmation step
  // with no way past it. Never in production: this is the raw token, and the
  // whole point of storing only its hash is that it exists nowhere else.
  if (!result.sent && process.env.NODE_ENV !== "production") {
    console.log(
      `[email] confirmation email not delivered (${result.reason}).\n` +
        `[email] Dev confirmation URL for user ${userId}:\n${confirmUrl}`,
    );
  }

  return result;
}

/** Email confirmed → welcome + how to get back in. */
export async function sendWelcomeEmail(userId: string): Promise<SendEmailResult> {
  return sendTemplate(
    "welcome",
    userId,
    "Welcome to Primary Brain Health",
    (recipient) =>
      WelcomeEmail({
        firstName: recipient.firstName,
        loginUrl: `${siteBaseUrl()}/login`,
      }),
  );
}

/** Payment first recorded as succeeded → receipt. */
export async function sendPaymentReceiptEmail(
  userId: string,
  payment: {
    amountCents: number;
    currency: string;
    cardBrand?: string | null;
    cardLast4?: string | null;
  },
): Promise<SendEmailResult> {
  return sendTemplate(
    "payment-receipt",
    userId,
    "Your Primary Brain Health receipt",
    (recipient) =>
      PaymentReceiptEmail({
        firstName: recipient.firstName,
        amountCents: payment.amountCents,
        currency: payment.currency,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        paidOn: new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
          new Date(),
        ),
        // The Engagement App when we know it, not our own gated /welcome: with
        // enrollment switched off this receipt is the only email a payer gets,
        // and both the session (15m idle) and the booking cookie (2h) are gone
        // by the time most people open it — /welcome would just bounce them to
        // a sign-in wall.
        assessmentsUrl: assessmentsUrl(),
      }),
  );
}

/** Payment first recorded as failed → decline notice with resume CTA. */
export async function sendPaymentFailedEmail(
  userId: string,
  payment: {
    amountCents: number;
    currency: string;
    cardBrand?: string | null;
    cardLast4?: string | null;
  },
): Promise<SendEmailResult> {
  return sendTemplate(
    "payment-failed",
    userId,
    "Your payment didn't go through",
    (recipient) =>
      PaymentFailedEmail({
        firstName: recipient.firstName,
        amountCents: payment.amountCents,
        currency: payment.currency,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        failedOn: new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
          new Date(),
        ),
        // Sign-in, not the resume marker directly: that marker resolves against
        // the booking cookie or a session, and this mail is usually opened on
        // another device or well after the cookie's 2h (pbh-is2). Signing in
        // lands on /welcome, which bounces an unpaid customer to
        // `/?booking=resume#booking` with the modal reopened on the step they
        // left — identity there comes from `resolveActorId`, so the session is
        // enough.
        updatePaymentUrl: `${siteBaseUrl()}/login?email=${encodeURIComponent(recipient.email)}`,
      }),
  );
}

/** First-ever enrollment resolution → the assessments are ready to start. */
export async function sendAssessmentReadyEmail(
  userId: string,
  assessments: Array<{ name: string; duration?: string }>,
): Promise<SendEmailResult> {
  return sendTemplate(
    "assessment-ready",
    userId,
    "Your brain health assessment is ready",
    (recipient) =>
      AssessmentReadyEmail({
        firstName: recipient.firstName,
        assessments,
        assessmentsUrl: assessmentsUrl(),
      }),
  );
}

/** Refund first recorded → confirmation with the amount and destination card. */
export async function sendPaymentRefundedEmail(
  userId: string,
  payment: {
    amountCents: number;
    currency: string;
    cardBrand?: string | null;
    cardLast4?: string | null;
  },
): Promise<SendEmailResult> {
  return sendTemplate(
    "payment-refunded",
    userId,
    "Your refund has been issued",
    (recipient) =>
      PaymentRefundedEmail({
        firstName: recipient.firstName,
        amountCents: payment.amountCents,
        currency: payment.currency,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
      }),
  );
}

/**
 * Deletion request filed from the account page → the confirmation that we have
 * it. Sent after `users.deactivated_at` is stamped, which is safe because that
 * stamp keeps the row intact: `loadRecipient` still finds the real address.
 *
 * Lives here with the booking senders rather than in the app because this is
 * the one place that owns Resend, the env gate and the `email_sent` audit row.
 * It is the only sender re-exported from `./index` — see the note there.
 */
export async function sendAccountDeactivatedEmail(
  userId: string,
): Promise<SendEmailResult> {
  return sendTemplate(
    "account-deactivated",
    userId,
    "Your account has been deactivated",
    (recipient) => AccountDeactivatedEmail({ firstName: recipient.firstName }),
  );
}
