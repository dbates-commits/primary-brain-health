import { Link, Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { emailColors } from "../theme";
import { ctaSectionStyle, paragraphStyle } from "../styles";

export interface ConfirmEmailEmailProps {
  /** One-time, expiring confirmation URL that resumes the booking. */
  confirmUrl: string;
}

/**
 * Sent immediately after signup (Figma 1088:2514). Confirms the address is
 * reachable and hands the customer back into the booking flow.
 *
 * The copy is deliberately impersonal and addresses the reader as a possible
 * *non*-participant ("someone has tried…"): anyone can type any address into the
 * signup form, so this email may land in the inbox of a person who did nothing.
 * It has to be readable as a security notice, not a welcome — which is also why
 * it uses no first name and carries no PHI.
 */
export function ConfirmEmailEmail({ confirmUrl }: ConfirmEmailEmailProps) {
  return (
    <EmailLayout
      previewText="Confirm your email to continue booking your assessment."
      heading="Email confirmation."
    >
      <Text style={paragraphStyle}>
        Someone has tried to create an assessment booking in our platform with
        this email.
      </Text>
      <Text style={paragraphStyle}>
        If this is you or someone in your personal circle, confirm your email by
        clicking{" "}
        <Link href={confirmUrl} style={linkStyle}>
          this link
        </Link>{" "}
        or by pressing the button below.
      </Text>
      <Text style={paragraphStyle}>
        If this was not you or any of your circle members, no action is needed —
        the booking cannot continue until the address is confirmed.
      </Text>
      <Section style={ctaSectionStyle}>
        <EmailButton href={confirmUrl}>Continue to Assessment</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = {
  color: emailColors.primary,
  textDecoration: "underline",
};

ConfirmEmailEmail.PreviewProps = {
  confirmUrl: "https://primarybrainhealth.com/booking/confirm?token=preview",
} satisfies ConfirmEmailEmailProps;

export default ConfirmEmailEmail;
