export { renderEmail, type RenderedEmail } from "./render";
export { siteBaseUrl } from "./base-url";

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
  PaymentFailedEmail,
  type PaymentFailedEmailProps,
} from "./emails/PaymentFailedEmail";
