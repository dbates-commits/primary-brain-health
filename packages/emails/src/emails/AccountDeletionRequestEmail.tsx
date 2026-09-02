import { Text } from "react-email";
import { EmailLayout } from "../components/EmailLayout";
import { mutedStyle, paragraphStyle } from "../styles";
import { emailColors, emailFontStack } from "../theme";

export interface AccountDeletionRequestEmailProps {
  /**
   * Linus's own id for the subject, or null when we never registered them —
   * in which case Linus holds nothing about this person and there is nothing
   * on their side to action.
   */
  linusParticipantId: string | null;
  /** Our id for the account, so PBH can be asked about the same request. */
  userId: string;
  /** When the request was filed, formatted as UTC. */
  requestedAt: string;
  /** Which deployment filed it, so a preview test is not actioned as real. */
  environment: string;
}

/**
 * Internal notice to Linus CS that a customer has asked to be deleted.
 *
 * **This is the stand-in for an API call.** Per the Jul 15/16 2026 Linus calls
 * the flow is deactivate-and-anonymize, but `@pbh/linus`'s client has no
 * deactivate endpoint (see the TODO in `deactivate-account-core.ts`), so the
 * subject keeps their PII on Linus's side until a human acts. This email is
 * that human's worklist. Delete it once the endpoint exists.
 *
 * **It carries identifiers, not identity.** The participant id and our user id
 * are pseudonymous keys — meaningless to anyone without the system that holds
 * the mapping — while the name, address, birth date and email are the fields
 * that would make this message itself a copy of the PII the customer is asking
 * us to stop holding. CS looks the subject up by participant id; nothing here
 * needs the rest, so nothing here carries it.
 */
export function AccountDeletionRequestEmail({
  linusParticipantId,
  userId,
  requestedAt,
  environment,
}: AccountDeletionRequestEmailProps) {
  return (
    <EmailLayout
      previewText="A Primary Brain Health customer has requested deletion."
      heading="Account deletion request"
    >
      <Text style={paragraphStyle}>
        A Primary Brain Health customer has requested deletion of their account.
        Their PBH account is already locked out; the Linus-side deactivation has
        to be done by hand.
      </Text>
      <Text style={labelStyle}>Linus participant ID</Text>
      <Text style={valueStyle}>
        {linusParticipantId ?? "None — never registered with Linus."}
      </Text>
      <Text style={labelStyle}>PBH user ID</Text>
      <Text style={valueStyle}>{userId}</Text>
      <Text style={labelStyle}>Requested at</Text>
      <Text style={valueStyle}>{requestedAt}</Text>
      <Text style={labelStyle}>Environment</Text>
      <Text style={valueStyle}>{environment}</Text>
      <Text style={mutedStyle}>
        No name, email address or date of birth is included by design — look the
        subject up by participant ID. Reply to this email to reach the PBH team
        about this request.
      </Text>
    </EmailLayout>
  );
}

const labelStyle: React.CSSProperties = {
  margin: "16px 0 2px",
  fontFamily: emailFontStack,
  fontSize: "12px",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: emailColors.textDefault,
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  // Identifiers get read back into a support tool character by character, so
  // they are set in a mono face where 0/O and 1/l are told apart.
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "14px",
  lineHeight: "20px",
  color: emailColors.inkStrong,
};

AccountDeletionRequestEmail.PreviewProps = {
  linusParticipantId: "8f2c41d0-6b19-4a3e-9c77-2ad5e0b41f6a",
  userId: "3b7e9a52-11c4-4d8f-8a30-6f0c2d9e5b18",
  requestedAt: "2 September 2026 at 14:35 UTC",
  environment: "production",
} satisfies AccountDeletionRequestEmailProps;

export default AccountDeletionRequestEmail;
