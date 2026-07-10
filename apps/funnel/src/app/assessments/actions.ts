"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, linusEnrollments, users } from "@pbh/db";
import { extractReportData, getCampaigns, getReport } from "@pbh/linus";
import {
  ASSESSMENT_UID_COOKIE,
  isValidEmail,
  normalizeEmail,
  registerAndEnrollUserById,
  runRegisterAndEnroll,
  type LinusState,
} from "@pbh/booking/server";

/** Short-lived cookie identifying whose assessments/reports to serve. */
const ASSESSMENT_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60,
};

/**
 * Form action for the `/login` email sign-in. On success we drop the assessment
 * session cookie for that user (so the page and report route, which auth via the
 * cookie, work) and forward to /assessments. On failure we return the error
 * state so the form can show it inline.
 */
export async function registerAndEnroll(
  _prev: LinusState,
  formData: FormData,
): Promise<LinusState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) {
    return { status: "error", email, message: "Enter a valid email address." };
  }
  const state = await runRegisterAndEnroll(email);
  if (state.status !== "success") {
    return state;
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (user) {
    (await cookies()).set(ASSESSMENT_UID_COOKIE, user.id, ASSESSMENT_COOKIE_OPTS);
  }
  redirect("/assessments");
}

/**
 * Payment step submit: register + enroll the paying user server-side and drop a
 * short-lived cookie identifying them (so /assessments, which auths via the
 * cookie, works — no email or PII in the URL). Returns the success state rather
 * than redirecting, so the funnel can show the "You're all set" confirmation and
 * let the user continue to /assessments themselves. On failure we return the
 * error state so the payment step can show it inline.
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

  (await cookies()).set(ASSESSMENT_UID_COOKIE, userId, ASSESSMENT_COOKIE_OPTS);
  return state;
}

/** ASCII-safe, hyphenated slug for a download filename. */
function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

/** Result of an on-demand report fetch (see `getReportPdf`). */
export type ReportResult =
  | { status: "ready"; dataBase64: string; filename: string }
  | { status: "not_ready" }
  | { status: "error"; message: string };

/**
 * Fetch a subject's report PDF on demand, returning its base64 bytes plus a
 * descriptive filename so the client can download it — no server-rendered report
 * route. Auth is the same short-lived cookie the page uses: the report is fetched
 * under the cookie user's own participantId, so a user can only read their own
 * report.
 */
export async function getReportPdf(enrollmentId: string): Promise<ReportResult> {
  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  if (!uid) {
    return { status: "error", message: "Your session has expired. Please sign in again." };
  }

  const [user] = await db
    .select({
      participantId: users.linusParticipantId,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  if (!user?.participantId) {
    return { status: "error", message: "We couldn't find an assessment account for you yet." };
  }

  let report: unknown;
  try {
    report = await getReport(user.participantId, enrollmentId, "patient-report");
  } catch {
    // A non-2xx (commonly 400/404) just means the report isn't generated yet.
    return { status: "not_ready" };
  }

  const dataBase64 = extractReportData(report);
  if (!dataBase64) {
    return { status: "not_ready" };
  }

  // Descriptive filename "<name>-<assessment>-brain-health-report.pdf"; the
  // assessment label comes from the campaign behind this enrollment. Fall back
  // gracefully if the row or campaign config is missing.
  const [row] = await db
    .select({ campaignId: linusEnrollments.campaignId })
    .from(linusEnrollments)
    .where(
      and(
        eq(linusEnrollments.userId, uid),
        eq(linusEnrollments.enrollmentId, enrollmentId),
      ),
    )
    .limit(1);
  const campaignKey = getCampaigns().find(
    (c) => c.campaignId === row?.campaignId,
  )?.key;
  const filename =
    slugify(
      [`${user.firstName} ${user.lastName}`, campaignKey, "brain health report"]
        .filter(Boolean)
        .join(" "),
    ) + ".pdf";

  return { status: "ready", dataBase64, filename };
}
