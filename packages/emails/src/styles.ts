import { emailColors, emailFontStack } from "./theme";

/** Shared inline text styles used across templates. */

export const headingStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: emailFontStack,
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "32px",
  color: emailColors.onSurface,
};

export const paragraphStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: emailFontStack,
  fontSize: "15px",
  lineHeight: "24px",
  color: emailColors.onSurface,
};

export const mutedStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: emailFontStack,
  fontSize: "13px",
  lineHeight: "20px",
  color: emailColors.onSurfaceVariant,
};

export const ctaSectionStyle: React.CSSProperties = {
  padding: "8px 0 12px",
  // `EmailButton` is an inline-block, so without this it sits hard left. Set on
  // the section rather than the button: react-email renders `Section` as a
  // table, and text-align inherits down to the cell, which is what actually
  // centres an inline-block in Outlook as well as the webmail clients.
  textAlign: "center",
};
