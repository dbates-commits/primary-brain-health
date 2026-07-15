import { Section, Text } from "react-email";
import { emailColors, emailFontStack } from "../theme";

/**
 * Text wordmark header. Deliberately image-free so emails render fully with
 * remote images blocked; swap in a hosted logo `<Img>` once a public asset
 * URL exists.
 */
export function EmailHeader() {
  return (
    <Section style={sectionStyle}>
      <Text style={wordmarkStyle}>Primary Brain Health</Text>
    </Section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: "28px 40px 0",
};

const wordmarkStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: emailFontStack,
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: emailColors.primaryContainer,
};
