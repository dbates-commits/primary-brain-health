import { Hr, Section, Text } from "react-email";
import { emailColors, emailFontStack } from "../theme";

interface EmailFooterProps {
  /** Shown as the "questions?" contact; rendered as a mailto link target. */
  supportEmail?: string;
}

export function EmailFooter({
  supportEmail = "support@primarybrainhealth.com",
}: EmailFooterProps) {
  return (
    <Section style={sectionStyle}>
      <Hr style={hrStyle} />
      <Text style={textStyle}>
        Questions? Reach us at{" "}
        <a href={`mailto:${supportEmail}`} style={linkStyle}>
          {supportEmail}
        </a>
        .
      </Text>
      <Text style={textStyle}>
        © {new Date().getFullYear()} Primary Brain Health. All rights reserved.
      </Text>
    </Section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: "0 40px 32px",
};

const hrStyle: React.CSSProperties = {
  borderColor: emailColors.outlineVariant,
  margin: "28px 0 20px",
};

const textStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontFamily: emailFontStack,
  fontSize: "12px",
  lineHeight: "18px",
  color: emailColors.onSurfaceVariant,
};

const linkStyle: React.CSSProperties = {
  color: emailColors.primary,
  textDecoration: "underline",
};
