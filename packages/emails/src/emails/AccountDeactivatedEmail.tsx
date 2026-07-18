import { Text } from "react-email";
import { EmailLayout } from "../components/EmailLayout";
import { mutedStyle, paragraphStyle } from "../styles";

export interface AccountDeactivatedEmailProps {
  firstName: string;
}

/**
 * Sent when an account deactivation ("right to be forgotten") request is
 * processed. Per the Jul 15/16 2026 Linus calls: the flow is DEACTIVATE, not
 * delete — Linus's endpoint anonymizes the PII while assessment results are
 * retained in de-identified form for aggregate reporting.
 *
 * COPY IS PLACEHOLDER: the exact deactivation/anonymization language must be
 * approved by Linus's attorney before launch (VB drafts, Linus legal signs
 * off). Keep this template's claims in lockstep with the approved T&C wording.
 */
export function AccountDeactivatedEmail({
  firstName,
}: AccountDeactivatedEmailProps) {
  return (
    <EmailLayout
      previewText="Your account has been deactivated."
      heading={`Your account has been deactivated, ${firstName}`}
    >
      <Text style={paragraphStyle}>
        We&apos;ve processed your request to deactivate your Primary Brain
        Health account.
      </Text>
      <Text style={paragraphStyle}>
        Your personal information has been removed from your records and can no
        longer be linked to you. De-identified assessment data may be retained
        for research and aggregate reporting, as described in our privacy
        practices.
      </Text>
      <Text style={paragraphStyle}>
        You won&apos;t receive any further emails from us, and this deactivation
        can&apos;t be undone.
      </Text>
      <Text style={mutedStyle}>
        If you didn&apos;t request this, contact us right away — reply to this
        email and we&apos;ll help.
      </Text>
    </EmailLayout>
  );
}

AccountDeactivatedEmail.PreviewProps = {
  firstName: "Alex",
} satisfies AccountDeactivatedEmailProps;

export default AccountDeactivatedEmail;
