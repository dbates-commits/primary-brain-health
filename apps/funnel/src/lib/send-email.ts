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

/** Base for the links inside emails (login, assessments). */
function appBaseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3001";
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

/** Signup completed → welcome + how to get back in. */
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
