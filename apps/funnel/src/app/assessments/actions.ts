"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { linusEnrollments, users } from "@/db/schema";
import { extractReportData, getReport } from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/campaigns";
import { establishAssessmentSession } from "@/lib/auth/session";
import { provisionClerkUserForPayingUser } from "@/lib/auth/clerk/provision";
import {
  ASSESSMENT_UID_COOKIE,
  registerAndEnrollUserById,
  type LinusState,
} from "./register-and-enroll";

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

  // Provision a Clerk account for the paying user so they can sign in later at
  // /clerk if they need to return. Non-fatal — never blocks the handoff.
  await provisionClerkUserForPayingUser(userId);

  await establishAssessmentSession(userId);
  redirect("/assessments");
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
