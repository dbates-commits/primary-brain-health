import { Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";

export interface MagicLinkEmailProps {
  firstName: string;
  /** One-time, expiring sign-in link (Auth.js verification URL). */
  magicLinkUrl: string;
  /** How long the link stays valid, in minutes — shown so the reader knows. */
  expiresMinutes: number;
}

/**
 * Passwordless sign-in: a single-use magic link. Carries no PHI — clicking it
 * only authenticates; assessment content still lives behind the signed-in app.
 */
export function MagicLinkEmail({
  firstName,
  magicLinkUrl,
  expiresMinutes,
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      previewText="Your secure sign-in link for Primary Brain Health."
      heading={`Sign in, ${firstName}`}
    >
      <Text style={paragraphStyle}>
        Use the button below to sign in to Primary Brain Health. No password
        needed — the link confirms it&apos;s you.
      </Text>
      <Section style={ctaSectionStyle}>
        <EmailButton href={magicLinkUrl}>Sign in to your account</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        This link expires in {expiresMinutes} minutes and can only be used once.
        If you didn&apos;t request it, you can safely ignore this email — your
        account stays secure.
      </Text>
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  firstName: "Alex",
  magicLinkUrl: "https://primarybrainhealth.com/api/auth/callback/magic-link?token=preview",
  expiresMinutes: 30,
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;
