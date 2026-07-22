import { render } from "@react-email/render";
import type { ReactElement } from "react";

export interface RenderedEmail {
  html: string;
  /** Plain-text alternative, for the multipart body (deliverability + a11y). */
  text: string;
}

/**
 * Render a template element to both HTML and plain text in one call — the
 * shape every sending provider (Resend/SES/Postmark/…) accepts. Usage:
 *
 *   const { html, text } = await renderEmail(
 *     WelcomeEmail({ firstName, loginUrl }),
 *   );
 */
export async function renderEmail(element: ReactElement): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
