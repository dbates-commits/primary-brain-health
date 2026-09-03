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
  AccountDeletionRequestEmail,
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
 * Where a deletion request is announced — Linus's customer-support desk, whose
 * job it is to deactivate the subject on their side because no API does it yet.
 *
 * No default, deliberately: an address baked in here is one an environment
 * cannot correct, and a deletion request is the last thing that should land in
 * somebody's inbox by accident. Unset means the notice is skipped and logged,
 * the same shape as an unset `RESEND_API_KEY`. `||`, not `??`, for the reason
 * `assessmentsUrl` states: the var ships empty.
 */
function deletionNoticeRecipient(): string | null {
  return process.env.ACCOUNT_DELETION_NOTICE_TO || null;
}

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

  return deliver({
    template,
    to: recipient.email,
    subject,
    userId,
    buildElement: () => buildElement(recipient),
  });
}

/**
 * Render one element, hand it to Resend, write the `email_sent` row.
 *
 * Split out of `sendTemplate` because not every send goes to the customer: the
 * deletion notice goes to Linus CS and is built from a row `loadRecipient`
 * never reads. `to` is therefore the caller's to choose, and the env gate stays
 * above in the two entry points so an unconfigured environment still never
 * touches the database.
 *
 * `buildElement` is a thunk, not an element, so that building it happens inside
 * the `try`. These are plain function calls, not JSX — `PaymentReceiptEmail`
 * formats money through `Intl.NumberFormat`, which throws on a currency code
 * Stripe hands us that ISO doesn't know — and a sender that throws would take
 * the Stripe webhook down with it *after* the payment was recorded, earning a
 * redelivery for fulfillment that already happened.
 */
async function deliver({
  template,
  to,
  subject,
  userId,
  buildElement,
}: {
  template: string;
  to: string;
  subject: string;
  /** The account the send is *about* — the audit row's subject, not the inbox. */
  userId: string;
  buildElement: () => React.ReactElement;
}): Promise<SendEmailResult> {
  try {
    const { html, text } = await renderEmail(buildElement());
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to,
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

/**
 * The same deletion request, announced to Linus CS (pbh-qbe).
 *
 * **A human doing an API call's job.** `deactivateAccountCore` stamps Neon and
 * stops there because `@pbh/linus` has no deactivate endpoint to call, so the
 * subject keeps their name, birth date, sex and education on Linus's side until
 * somebody over there acts. This mail is how they find out. When the endpoint
 * lands, this send and its template go.
 *
 * **It reads the row, not `loadRecipient`.** The message deliberately carries
 * no name or address — only the two pseudonymous ids and a timestamp — so the
 * customer's own fields are never fetched for it. See the note on the template.
 *
 * Never throws, like every sender here: the customer's request is already
 * filed, and a failure to notify Linus must not unfile it. A `send-failed` is
 * an operational alert, not a caller-visible error.
 */
export async function sendAccountDeletionNoticeEmail(
  userId: string,
): Promise<SendEmailResult> {
  const template = "account-deletion-notice";

  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[email] RESEND_API_KEY not set — skipped "${template}" for user ${userId}`,
    );
    return { sent: false, reason: "not-configured" };
  }

  const to = deletionNoticeRecipient();
  if (!to) {
    console.error(
      `[email] ACCOUNT_DELETION_NOTICE_TO not set — nobody was told about the ` +
        `deletion request for user ${userId}`,
    );
    return { sent: false, reason: "not-configured" };
  }

  let user: { linusParticipantId: string | null; deactivatedAt: Date | null };
  try {
    const [row] = await db
      .select({
        linusParticipantId: users.linusParticipantId,
        deactivatedAt: users.deactivatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) {
      console.error(`[email] no user ${userId} — skipped send`);
      return { sent: false, reason: "no-user" };
    }
    user = row;
  } catch (err) {
    console.error(`[email] lookup for "${template}" failed:`, err);
    return { sent: false, reason: "send-failed" };
  }

  return deliver({
    template,
    to,
    // The participant id in the subject so CS can find and de-duplicate a
    // request without opening it. Pseudonymous, like the body.
    subject: `Account deletion request — participant ${user.linusParticipantId ?? "not registered"}`,
    userId,
    buildElement: () =>
      AccountDeletionRequestEmail({
        linusParticipantId: user.linusParticipantId,
        userId,
        // The stamp this send was triggered by, not the clock: a retry days
        // later must still name the moment the customer asked.
        requestedAt: formatUtc(user.deactivatedAt ?? new Date()),
        environment: currentEnvironment(),
      }),
  });
}

/** `2 September 2026 at 14:35 UTC` — unambiguous across the two countries. */
function formatUtc(at: Date): string {
  const stamp = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(at);
  return `${stamp} UTC`;
}

/**
 * Which deployment sent this, so a request filed against a preview branch is
 * not actioned as a real customer's. `DATABASE_ENV` first: it names the data,
 * which is the thing CS would be acting on.
 */
function currentEnvironment(): string {
  return (
    process.env.DATABASE_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "unknown"
  );
}
