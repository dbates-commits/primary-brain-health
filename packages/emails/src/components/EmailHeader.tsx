import { Img, Section } from "react-email";
import { emailLogoUrl } from "../theme";

/**
 * Brand logo header. The source PNG is 1500×632; rendered at 95×40 (same
 * ratio) with explicit dimensions so image-blocking clients reserve the
 * space. 95px wide is about the floor where the stacked three-line wordmark
 * stays legible. The alt text doubles as the wordmark fallback when images
 * are blocked.
 */
export function EmailHeader() {
  return (
    <Section style={sectionStyle}>
      <Img
        src={emailLogoUrl()}
        alt="Primary Brain Health"
        width="95"
        height="40"
        style={logoStyle}
      />
    </Section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: "28px 40px 24px",
};

const logoStyle: React.CSSProperties = {
  display: "block",
};
