import { Body, Container, Head, Html, Preview, Section } from "react-email";
import { emailColors } from "../theme";
import { EmailFooter } from "./EmailFooter";
import { EmailHeader } from "./EmailHeader";
import { EmailHero } from "./EmailHero";

interface EmailLayoutProps {
  /** Inbox preview snippet (the grey text after the subject line). */
  previewText: string;
  /** Heading rendered in the white-on-teal hero band. */
  heading: React.ReactNode;
  /** Optional white sub-headline under the hero heading. */
  subhead?: React.ReactNode;
  /** Optional teal-washed hero background image (behind the teal fallback). */
  heroBackgroundImageUrl?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for every PBH email: brand header, teal hero band, white card
 * on the warm off-white page background, and the standard footer.
 */
export function EmailLayout({
  previewText,
  heading,
  subhead,
  heroBackgroundImageUrl,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={cardStyle}>
          <EmailHeader />
          <EmailHero
            heading={heading}
            subhead={subhead}
            backgroundImageUrl={heroBackgroundImageUrl}
          />
          <Section style={contentStyle}>{children}</Section>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: emailColors.surfaceContainerLow,
  margin: 0,
  padding: "32px 16px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: emailColors.surface,
  borderRadius: "16px",
  maxWidth: "560px",
  margin: "0 auto",
};

const contentStyle: React.CSSProperties = {
  padding: "8px 40px 0",
};
