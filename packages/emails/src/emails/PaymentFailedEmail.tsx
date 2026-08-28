import { Column, Row, Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { formatAmount, formatCard } from "../format";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";
import { emailColors, emailFontStack } from "../theme";

export interface PaymentFailedEmailProps {
  firstName: string;
  /** Minor units, straight off the failed PaymentIntent (e.g. 14900). */
  amountCents: number;
  /** ISO currency code off the PaymentIntent (e.g. "usd"). */
  currency: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  /** Pre-formatted display date (e.g. "July 14, 2026"); the sender formats. */
  failedOn: string;
  /** Where the customer retries — the hosted checkout / billing page. */
  updatePaymentUrl: string;
}

/** Sent when a payment fails: what we tried, why it may have failed, how to retry. */
export function PaymentFailedEmail({
  firstName,
  amountCents,
  currency,
  cardBrand,
  cardLast4,
  failedOn,
  updatePaymentUrl,
}: PaymentFailedEmailProps) {
  const card = formatCard(cardBrand, cardLast4);
  return (
    <EmailLayout
      previewText="We couldn't process your payment — update your payment method."
      heading="Payment method has failed."
    >
      <Text style={paragraphStyle}>
        {firstName}, we were unable to process your most recent payment. This
        may be due to an expired card, insufficient funds, or a hold placed by
        your bank.
      </Text>
      <Section style={receiptStyle}>
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Item</Text>
          </Column>
          <Column align="right">
            <Text style={receiptValueStyle}>Cognitive assessment</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Amount</Text>
          </Column>
          <Column align="right">
            <Text style={receiptValueStyle}>
              {formatAmount(amountCents, currency)}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Payment method</Text>
          </Column>
          <Column align="right">
            <Text style={receiptFailedStyle}>
              {card ? `${card} — Failed` : "Failed"}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Date</Text>
          </Column>
          <Column align="right">
            <Text style={receiptValueStyle}>{failedOn}</Text>
          </Column>
        </Row>
      </Section>
      <Section style={ctaSectionStyle}>
        <EmailButton href={updatePaymentUrl}>Update payment method</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        Your assessment is being held until the payment goes through. If you
        think this is a mistake, reply and we&apos;ll sort it out.
      </Text>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = {
  firstName: "Alex",
  amountCents: 14900,
  currency: "usd",
  cardBrand: "visa",
  cardLast4: "4242",
  failedOn: "July 14, 2026",
  updatePaymentUrl: "https://primarybrainhealth.com/?booking=resume",
} satisfies PaymentFailedEmailProps;

export default PaymentFailedEmail;

const receiptStyle: React.CSSProperties = {
  backgroundColor: emailColors.surfaceContainer,
  borderRadius: "12px",
  padding: "8px 20px",
  margin: "0 0 20px",
};

const receiptLabelStyle: React.CSSProperties = {
  margin: "6px 0",
  fontFamily: emailFontStack,
  fontSize: "13px",
  lineHeight: "20px",
  color: emailColors.onSurfaceVariant,
};

const receiptValueStyle: React.CSSProperties = {
  margin: "6px 0",
  fontFamily: emailFontStack,
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: "20px",
  color: emailColors.onSurface,
};

/**
 * Same row treatment as `receiptValueStyle`, in the error red — the design
 * (Figma 1396:2061) calls out the failed status as the one coloured value in
 * the panel. Uses the project's `--color-error` rather than the design's raw
 * #d60012 so it tracks the token set with the rest of the emails.
 */
const receiptFailedStyle: React.CSSProperties = {
  ...receiptValueStyle,
  color: emailColors.error,
};
