# @pbh/emails

Transactional email templates for the PBH funnel, built with
[react-email](https://react.email) v6. Rendering only — no sending
provider is wired here; the consumer (funnel server action / webhook)
renders and sends.

## Preview

```bash
pnpm --filter @pbh/emails dev   # preview server on http://localhost:3002
```

Each template exports `PreviewProps`, so the preview renders with realistic
sample data.

## Templates

| Template | Funnel trigger (to be wired) |
| --- | --- |
| `WelcomeEmail` | Signup completes (`get-started/signup`) |
| `PaymentReceiptEmail` | Payment succeeds (`fulfill.ts` / Stripe webhook) |
| `AssessmentReadyEmail` | Linus enrollment lands (`register-and-enroll.ts`) |
| `ReportReadyEmail` | A report becomes available (`report_ready`) |
| `PaymentRefundedEmail` | Refund recorded (`recordRefundedPayment`) |
| `AccountDeactivatedEmail` | Account deactivation processed (flow not built yet; copy pending Linus-attorney approval) |

## Usage (the later hook-up branch)

```ts
import { renderEmail, WelcomeEmail } from "@pbh/emails";

const { html, text } = await renderEmail(
  WelcomeEmail({ firstName: user.firstName, loginUrl }),
);
// hand html + text to the sending provider
```

## Styling

Brand values from `@pbh/tokens/theme.css` are mirrored as email-safe inline
hex in `src/theme.ts` (email clients can't consume CSS variables or Tailwind).
If a token changes in `theme.css`, update `src/theme.ts` to match.
