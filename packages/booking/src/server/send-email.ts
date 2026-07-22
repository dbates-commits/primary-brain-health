/**
 * Transactional email sends for the funnel, built on Resend + `@pbh/emails`.
 *
 * Env-gated: when `RESEND_API_KEY` is unset (local dev, preview without keys)
 * every send is a logged no-op, so the funnel works end-to-end with no email
 * setup. Senders NEVER throw — email is a side effect of flows (signup,
 * payment, enrollment) that must not fail because a send did. Callers should
 * `await` them anyway: on Vercel, work left un-awaited after the response is
 * frozen with the function.
 *
 * PHI rule: emails carry no assessment results or report content — only links
 * back to the app, where viewing requires signing in.
 */

import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db, users, writeAuditLog } from "@pbh/db";
import {
  AssessmentReadyEmail,
  ConfirmEmailEmail,
  PaymentReceiptEmail,
  PaymentRefundedEmail,
  renderEmail,
  ReportReadyEmail,
  WelcomeEmail,
} from "@pbh/emails";

/**
 * Sender identity. Until the PBH domain is verified in Resend, the fallback
 * `onboarding@resend.dev` works for dev sends to the Resend account's own
 * email address; production sets EMAIL_FROM once the domain is verified.
 */
const DEFAULT_FROM = "Primary Brain Health <onboarding@resend.dev>";

/** Base for the links inside emails (login, assessments) — the funnel app. */
function appBaseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3001";
}

/**
 * Base for links back into the booking flow — the MARKETING app, which is where
 * the booking modal lives. Distinct from `appBaseUrl()`: the two run on separate
 * origins, and a confirmation link pointed at the funnel would land on a page
 * that has no booking flow to resume.
 *
 * Falls back to `VERCEL_URL`, the per-deployment hostname, so Preview works
 * without configuration. A fixed value there would be wrong the moment a new
 * preview is built: every confirmation link would point back at whichever
 * deployment happened to be current when the variable was set. Production sets
 * `BOOKING_BASE_URL` explicitly, because `VERCEL_URL` is the generated
 * `*.vercel.app` host rather than the real domain.
 */
function bookingBaseUrl(): string {
  if (process.env.BOOKING_BASE_URL) {
    return process.env.BOOKING_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
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
 * — the same affordance the funnel's magic link has. That log is the only place
 * the raw token appears outside the recipient's inbox.
 */
export async function sendConfirmEmail(
  userId: string,
  rawToken: string,
): Promise<SendEmailResult> {
  const confirmUrl = `${bookingBaseUrl()}/booking/confirm?token=${encodeURIComponent(rawToken)}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[email] RESEND_API_KEY not set — confirmation email skipped.\n` +
        `[email] Dev confirmation URL for user ${userId}:\n${confirmUrl}`,
    );
    return { sent: false, reason: "not-configured" };
  }

  return sendTemplate(
    "confirm-email",
    userId,
    "Confirm your email to continue",
    () => ConfirmEmailEmail({ confirmUrl }),
  );
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
        loginUrl: `${appBaseUrl()}/login`,
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
        assessmentsUrl: `${appBaseUrl()}/assessments`,
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
        assessmentsUrl: `${appBaseUrl()}/assessments`,
      }),
  );
}

/** A completed assessment's report became available → link back to sign in. */
export async function sendReportReadyEmail(
  userId: string,
  assessmentName: string,
): Promise<SendEmailResult> {
  return sendTemplate(
    "report-ready",
    userId,
    "Your assessment report is ready",
    (recipient) =>
      ReportReadyEmail({
        firstName: recipient.firstName,
        assessmentName,
        assessmentsUrl: `${appBaseUrl()}/assessments`,
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
