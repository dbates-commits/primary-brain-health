import type { SignupAction, DetailsAction, ConsentAction } from "@pbh/booking";

/**
 * Placeholder per-step actions for the marketing booking modal. They make the
 * flow walkable without a backend. `pbh-ggr.5` replaces these with real server
 * actions that call the shared @pbh/db / @pbh/payments / @pbh/linus layer.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signupStub: SignupAction = async (_prev, formData) => {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!firstName) {
    fieldErrors.firstName = "Enter your first name.";
  }
  if (!lastName) {
    fieldErrors.lastName = "Enter your last name.";
  }
  if (!EMAIL_RE.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the fields below.",
      fieldErrors,
      values: { firstName, lastName, email },
    };
  }

  return { status: "success", userId: "preview", email, firstName, lastName };
};

export const detailsStub: DetailsAction = async () => ({ status: "success" });

export const consentStub: ConsentAction = async () => ({ status: "success" });
