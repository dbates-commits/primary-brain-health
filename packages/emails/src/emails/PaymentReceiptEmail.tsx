import { Column, Row, Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { formatAmount, formatCard } from "../format";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";
import { emailColors, emailFontStack } from "../theme";

export interface PaymentReceiptEmailProps {
  firstName: string;
  /** Minor units, straight off the PaymentIntent (e.g. 14900). */
  amountCents: number;
  /** ISO currency code off the PaymentIntent (e.g. "usd"). */
  currency: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  /** Pre-formatted display date (e.g. "July 14, 2026"); the sender formats. */
  paidOn: string;
  /** Where the paid-for assessments live (the funnel /assessments page). */
  assessmentsUrl: string;
}

/** Sent when a payment succeeds: receipt details + the door to assessments. */
export function PaymentReceiptEmail({
  firstName,
  amountCents,
  currency,
  cardBrand,
  cardLast4,
  paidOn,
  assessmentsUrl,
}: PaymentReceiptEmailProps) {
  const card = formatCard(cardBrand, cardLast4);
  return (
    <EmailLayout
      previewText="Your payment was received — your assessment is ready."
      heading={`Thanks for your payment, ${firstName}`}
    >
      <Text style={paragraphStyle}>
        We&apos;ve received your payment for the Primary Brain Health cognitive
        assessment. Here&apos;s your receipt:
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
        {card ? (
          <Row>
            <Column>
              <Text style={receiptLabelStyle}>Payment method</Text>
            </Column>
            <Column align="right">
              <Text style={receiptValueStyle}>{card}</Text>
            </Column>
          </Row>
        ) : null}
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Date</Text>
          </Column>
          <Column align="right">
            <Text style={receiptValueStyle}>{paidOn}</Text>
          </Column>
        </Row>
      </Section>
      <Section style={ctaSectionStyle}>
        <EmailButton href={assessmentsUrl}>Go to your assessments</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        Keep this email for your records. If anything looks wrong, reply and
        we&apos;ll sort it out.
      </Text>
    </EmailLayout>
  );
}

PaymentReceiptEmail.PreviewProps = {
  firstName: "Alex",
  amountCents: 14900,
  currency: "usd",
  cardBrand: "visa",
  cardLast4: "4242",
  paidOn: "July 14, 2026",
  assessmentsUrl: "https://primarybrainhealth.com/assessments",
} satisfies PaymentReceiptEmailProps;

export default PaymentReceiptEmail;

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
