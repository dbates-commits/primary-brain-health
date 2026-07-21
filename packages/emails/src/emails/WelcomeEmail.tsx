import { Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";
import { emailHeroImageUrl } from "../theme";

export interface WelcomeEmailProps {
  firstName: string;
  /** Where the user signs back in to continue (the funnel /login page). */
  loginUrl: string;
}

/** Sent right after signup: the account exists, here's how to get back in. */
export function WelcomeEmail({ firstName, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText="Your Primary Brain Health account is ready."
      heading={`Welcome, ${firstName}`}
      heroBackgroundImageUrl={emailHeroImageUrl()}
    >
      <Text style={paragraphStyle}>
        Your Primary Brain Health account has been created. You&apos;re one step closer to a clearer
        picture of your cognitive health.
      </Text>
      <Text style={paragraphStyle}>
        You can sign back in at any time with the email address you registered. We&apos;ll pick up
        right where you left off.
      </Text>
      <Section style={ctaSectionStyle}>
        <EmailButton href={loginUrl}>Sign in to your account</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        If you didn&apos;t create this account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Alex",
  loginUrl: "https://primarybrainhealth.com/login",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
