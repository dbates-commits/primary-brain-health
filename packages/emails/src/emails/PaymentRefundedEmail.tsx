import { Heading, Text } from "react-email";
import { EmailLayout } from "../components/EmailLayout";
import { formatAmount, formatCard } from "../format";
import { headingStyle, mutedStyle, paragraphStyle } from "../styles";

export interface PaymentRefundedEmailProps {
  firstName: string;
  /** Minor units, straight off the refunded payment (e.g. 14900). */
  amountCents: number;
  /** ISO currency code (e.g. "usd"). */
  currency: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
}

/** Sent when a payment is refunded: confirmation + where the money lands. */
export function PaymentRefundedEmail({
  firstName,
  amountCents,
  currency,
  cardBrand,
  cardLast4,
}: PaymentRefundedEmailProps) {
  const card = formatCard(cardBrand, cardLast4);
  return (
    <EmailLayout previewText="Your refund has been issued.">
      <Heading style={headingStyle}>Your refund is on its way, {firstName}</Heading>
      <Text style={paragraphStyle}>
        We&apos;ve issued a refund of {formatAmount(amountCents, currency)}
        {card ? ` to your ${card}` : ""}. Depending on your bank, it can take
        5–10 business days to appear on your statement.
      </Text>
      <Text style={mutedStyle}>
        If you have any questions about this refund, just reply to this email.
      </Text>
    </EmailLayout>
  );
}

PaymentRefundedEmail.PreviewProps = {
  firstName: "Alex",
  amountCents: 14900,
  currency: "usd",
  cardBrand: "visa",
  cardLast4: "4242",
} satisfies PaymentRefundedEmailProps;

export default PaymentRefundedEmail;
