# @pbh/emails

Transactional email templates for PBH, built with
[react-email](https://react.email) v6. Rendering only — no sending provider is
wired here; the consumer (a marketing server action or the Stripe webhook, via
`packages/booking/src/server/send-email.ts`) renders and sends.

## Preview

```bash
pnpm --filter @pbh/emails dev   # preview server on http://localhost:3002
```

Each template exports `PreviewProps`, so the preview renders with realistic
sample data.

## Templates

| Template | Trigger |
| --- | --- |
| `WelcomeEmail` | Email confirmation redeemed (`email-verification.ts`) |
| `ConfirmEmailEmail` | Signup completes (`email-verification.ts`) |
| `MagicLinkEmail` | Sign-in requested (`apps/marketing/src/lib/auth-email.ts`) |
| `PaymentReceiptEmail` | Payment succeeds (`fulfill.ts` / Stripe webhook) |
| `AssessmentReadyEmail` | Linus enrollment lands (`register-and-enroll.ts`) |
| `PaymentRefundedEmail` | Refund recorded (`recordRefundedPayment`) |
| `AccountDeactivatedEmail` | Account deactivation processed (flow not built yet; copy pending Linus-attorney approval) |

## Usage

```ts
import { renderEmail, WelcomeEmail } from "@pbh/emails";

const { html, text } = await renderEmail(
  WelcomeEmail({ firstName: user.firstName, loginUrl }),
);
// hand html + text to the sending provider
```

## Styling

Absolute URLs (logo, hero image) are built from `siteBaseUrl()` in
`src/base-url.ts` — `BOOKING_BASE_URL`, else `VERCEL_URL`, else localhost. The
assets themselves are served from `apps/marketing/public/email-assets/`.

Brand values from `@pbh/tokens/theme.css` are mirrored as email-safe inline
hex in `src/theme.ts` (email clients can't consume CSS variables or Tailwind).
If a token changes in `theme.css`, update `src/theme.ts` to match.
