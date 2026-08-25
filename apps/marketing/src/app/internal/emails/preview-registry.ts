import {
  AccountDeactivatedEmail,
  AssessmentReadyEmail,
  PaymentFailedEmail,
  PaymentReceiptEmail,
  PaymentRefundedEmail,
  WelcomeEmail,
} from "@pbh/emails";

export interface EmailPreview {
  /** URL-anchor id and stable key. */
  slug: string;
  name: string;
  /** Keep in sync with the subjects in `@pbh/booking/server` (send-email.ts). */
  subject: string;
  /** When the real send fires, for stakeholder context. */
  trigger: string;
  element: React.ReactElement;
}

/**
 * Every template from `@pbh/emails`, instantiated with its own PreviewProps —
 * the same sample data the react-email dev preview uses. Add new templates
 * here so they show up at /internal/emails.
 */
export const emailPreviews: EmailPreview[] = [
  {
    slug: "welcome",
    name: "Welcome",
    subject: "Welcome to Primary Brain Health",
    trigger: "Sent when the emailed confirmation link is redeemed at signup.",
    element: WelcomeEmail(WelcomeEmail.PreviewProps),
  },
  {
    slug: "payment-receipt",
    name: "Payment receipt",
    subject: "Your Primary Brain Health receipt",
    trigger: "Sent once, when a payment is first recorded as succeeded.",
    element: PaymentReceiptEmail(PaymentReceiptEmail.PreviewProps),
  },
  {
    slug: "assessment-ready",
    name: "Assessment ready",
    subject: "Your brain health assessment is ready",
    trigger:
      "Sent when a user's assessments are first enrolled. NOT CURRENTLY SENT — nothing registers or enrolls anyone (pbh-ek8); kept because the template is what that send will use.",
    element: AssessmentReadyEmail(AssessmentReadyEmail.PreviewProps),
  },
  {
    slug: "payment-failed",
    name: "Payment failed",
    subject: "Your payment didn't go through",
    trigger:
      "Sent when a payment attempt fails. NOT CURRENTLY SENT — the Stripe webhook doesn't yet handle the failure event; the template is what that send will use.",
    element: PaymentFailedEmail(PaymentFailedEmail.PreviewProps),
  },
  {
    slug: "payment-refunded",
    name: "Payment refunded",
    subject: "Your refund has been issued",
    trigger: "Sent once, when a payment is refunded.",
    element: PaymentRefundedEmail(PaymentRefundedEmail.PreviewProps),
  },
  {
    slug: "account-deactivated",
    name: "Account deactivated",
    subject: "Your account has been deactivated",
    trigger:
      "Sent when someone files a deletion request from the account page. Copy is placeholder pending Linus-attorney-approved language — and note the request only stamps `deactivated_at`; the erasure it describes is an operator routine.",
    element: AccountDeactivatedEmail(AccountDeactivatedEmail.PreviewProps),
  },
];
