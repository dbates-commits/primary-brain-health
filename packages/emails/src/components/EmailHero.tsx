import { Heading, Section, Text } from "react-email";
import { emailColors, emailFontStack } from "../theme";

interface EmailHeroProps {
  heading: React.ReactNode;
  /** Optional white sub-headline under the main hero heading. */
  subhead?: React.ReactNode;
  /**
   * Optional hero background image (already teal-washed). Rendered under the
   * teal `backgroundColor`, which stays as the fallback for clients that drop
   * CSS background images (e.g. Outlook desktop).
   */
  backgroundImageUrl?: string;
}

/**
 * Full-width teal hero band with white heading text. Matches the Figma
 * design's hero color treatment. Deliberately reuses `emailFontStack` (the
 * same family used elsewhere in these emails) rather than the design's serif,
 * which isn't reliably servable to email clients.
 */
export function EmailHero({ heading, subhead, backgroundImageUrl }: EmailHeroProps) {
  const style = backgroundImageUrl
    ? {
        ...heroStyle,
        // Roughly double the plain hero's height so more of the photo shows.
        padding: "96px 40px",
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : heroStyle;
  return (
    <Section style={wrapperStyle}>
      <Section style={style}>
        <Heading style={headingStyle}>{heading}</Heading>
        {subhead ? <Text style={subheadStyle}>{subhead}</Text> : null}
      </Section>
    </Section>
  );
}

/**
 * 32px horizontal inset (full card width − 64px) plus a 24px gap below the
 * hero; combined with the content section's 8px top padding that leaves 32px
 * of breathing room before the first line of body copy.
 */
const wrapperStyle: React.CSSProperties = {
  padding: "0 32px 24px",
};

const heroStyle: React.CSSProperties = {
  backgroundColor: emailColors.primary,
  borderRadius: "16px",
  padding: "40px",
  textAlign: "center",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: emailFontStack,
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "32px",
  color: emailColors.onPrimary,
};

const subheadStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontFamily: emailFontStack,
  fontSize: "15px",
  lineHeight: "24px",
  color: emailColors.onPrimary,
};
