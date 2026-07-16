import {
  AccountDeactivatedEmail,
  AssessmentReadyEmail,
  PaymentReceiptEmail,
  PaymentRefundedEmail,
  ReportReadyEmail,
  WelcomeEmail,
} from "@pbh/emails";

export interface EmailPreview {
  /** URL-anchor id and stable key. */
  slug: string;
  name: string;
  /** Keep in sync with the subjects in `@/lib/send-email`. */
  subject: string;
  /** When the real send fires, for stakeholder context. */
  trigger: string;
  element: React.ReactElement;
}

/**
 * Every template from `@pbh/emails`, instantiated with its own PreviewProps —
 * the same sample data the react-email dev preview uses. Add new templates
 * here so they show up at /emails.
 */
export const emailPreviews: EmailPreview[] = [
  {
    slug: "welcome",
    name: "Welcome",
    subject: "Welcome to Primary Brain Health",
    trigger: "Sent right after an account is created in the get-started flow.",
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
    trigger: "Sent when the user's assessments are first enrolled and ready to start.",
    element: AssessmentReadyEmail(AssessmentReadyEmail.PreviewProps),
  },
  {
    slug: "report-ready",
    name: "Report ready",
    subject: "Your assessment report is ready",
    trigger: "Sent when a completed assessment's report becomes available.",
    element: ReportReadyEmail(ReportReadyEmail.PreviewProps),
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
      "Sent when an account deactivation request is processed. Copy is placeholder pending Linus-attorney-approved language; the in-app flow isn't built yet.",
    element: AccountDeactivatedEmail(AccountDeactivatedEmail.PreviewProps),
  },
];
