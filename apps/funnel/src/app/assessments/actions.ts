"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ASSESSMENT_UID_COOKIE,
  registerAndEnrollUserById,
  runRegisterAndEnroll,
  type LinusState,
} from "./register-and-enroll";

/** Form action for the manual `/assessments` email form. */
export async function registerAndEnroll(
  _prev: LinusState,
  formData: FormData,
): Promise<LinusState> {
  return runRegisterAndEnroll(String(formData.get("email") ?? ""));
}

/**
 * Payment step submit: register + enroll the paying user server-side, drop a
 * short-lived cookie identifying them, then forward to /assessments — so no
 * email or PII ends up in the URL. On failure we return the error state so the
 * payment step can show it inline (no redirect).
 *
 * NOTE: the cookie is an unsigned user id — acceptable for this unauthenticated
 * scaffold (it mirrors the details step's client-trusted userId). Gate this
 * behind a real signed session once auth lands.
 */
export async function completeAssessmentSetup(
  _prev: LinusState,
  formData: FormData,
): Promise<LinusState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const state = await registerAndEnrollUserById(userId);
  if (state.status !== "success") {
    return state;
  }

  (await cookies()).set(ASSESSMENT_UID_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  redirect("/assessments");
}
