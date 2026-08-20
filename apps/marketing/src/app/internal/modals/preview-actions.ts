import type {
  ConsentAction,
  CreateCheckoutAction,
  DetailsAction,
  PaymentFinalizeAction,
} from "@pbh/booking";

/**
 * Inert stand-ins for the step actions, so the preview renders the real forms
 * without touching the booking a visitor might have in progress.
 *
 * The real actions would refuse anyway — each resolves the account from the
 * signed booking cookie, and nobody reading this page has one — but they would
 * refuse by writing an audit entry and returning "we couldn't find your
 * booking", which reads as a bug rather than a preview. Two of them genuinely
 * must be stubbed: `PaymentStep` mints its Checkout Session from a mount effect,
 * so the real action would create a live Stripe Session on every view, and the
 * confirmation step's resend really does send — this route is reachable in
 * production, so a visitor holding a booking cookie could mail themselves from
 * it.
 */
const PREVIEW_NOTICE =
  "Preview only — this form isn't submitted and no booking is created.";

export const previewDetails: DetailsAction = async (_prev, formData) => ({
  status: "error",
  message: PREVIEW_NOTICE,
  // Echoed back so the fields keep what was typed, exactly as the real action
  // does on a validation failure.
  values: {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    educationLevel: String(formData.get("educationLevel") ?? ""),
  },
});

export const previewConsent: ConsentAction = async () => ({
  status: "error",
  message: PREVIEW_NOTICE,
});

export const previewCheckout: CreateCheckoutAction = async () => ({
  status: "error",
  message:
    "Preview only — no payment session is created here. Stripe's card form renders in its place on the live site.",
});

export const previewFinalize: PaymentFinalizeAction = async () => ({
  status: "idle",
});

/**
 * Reports success without sending, which is exactly what the real action looks
 * like from here: it never tells the browser whether an email went out, so the
 * preview reads identically to the live step.
 */
export const previewResend = async (): Promise<{ ok: true }> => ({ ok: true });
