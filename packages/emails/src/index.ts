export { renderEmail, type RenderedEmail } from "./render";
export { siteBaseUrl } from "./base-url";
// Money formatting started here because the receipt emails needed it, but it is
// not email-specific: the account page's Current Plan card renders the same
// charge. Exported rather than copied so one Intl configuration decides how an
// amount reads everywhere.
export { formatAmount, formatCard } from "./format";

export { WelcomeEmail, type WelcomeEmailProps } from "./emails/WelcomeEmail";
export {
  MagicLinkEmail,
  type MagicLinkEmailProps,
} from "./emails/MagicLinkEmail";
export {
  ConfirmEmailEmail,
  type ConfirmEmailEmailProps,
} from "./emails/ConfirmEmailEmail";
export {
  PaymentReceiptEmail,
  type PaymentReceiptEmailProps,
} from "./emails/PaymentReceiptEmail";
export {
  AssessmentReadyEmail,
  type AssessmentReadyEmailProps,
} from "./emails/AssessmentReadyEmail";
export {
  PaymentRefundedEmail,
  type PaymentRefundedEmailProps,
} from "./emails/PaymentRefundedEmail";
export {
  AccountDeactivatedEmail,
  type AccountDeactivatedEmailProps,
} from "./emails/AccountDeactivatedEmail";
export {
  AccountDeletionRequestEmail,
  type AccountDeletionRequestEmailProps,
} from "./emails/AccountDeletionRequestEmail";
export {
  PaymentFailedEmail,
  type PaymentFailedEmailProps,
} from "./emails/PaymentFailedEmail";
