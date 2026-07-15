import { Button } from "react-email";
import { emailColors, emailFontStack } from "../theme";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

/** Brand CTA button — solid primary, pill-shaped like the web `Button`. */
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: emailColors.primary,
  color: emailColors.onPrimary,
  fontFamily: emailFontStack,
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "20px",
  padding: "12px 28px",
  borderRadius: "9999px",
  textDecoration: "none",
  display: "inline-block",
};
