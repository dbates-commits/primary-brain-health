import "server-only";

/**
 * Identity seam for the booking flow.
 *
 * Today the paying user's id rides along in the multi-step flow (returned by
 * `createAccountCore` at signup, carried in client memory, and posted back as a
 * hidden `userId` field on the details/consent steps). This function is the
 * single, deliberate place that reads it — so it's the one thing that changes
 * when real auth lands.
 *
 * TODO(clerk): Clerk will own identity. Replace the body with the server-side
 * session read (`const { userId } = await auth()`) and drop the hidden `userId`
 * field from the step forms — the client-trusted value stops being trusted.
 */
export function resolveBookingUserId(formData: FormData): string {
  return String(formData.get("userId") ?? "").trim();
}
