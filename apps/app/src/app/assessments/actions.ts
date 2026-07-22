"use server";

import { and, eq } from "drizzle-orm";
import { db, linusEnrollments, users } from "@pbh/db";
import { extractReportData, getCampaigns, getReport } from "@pbh/linus";
import { auth } from "@/auth";
import {
  registerAndEnrollUserById,
  type LinusState,
} from "@pbh/booking/server";

/**
 * Register + enroll a user server-side, returning the state the caller renders.
 *
 * NOTE: this deliberately does NOT sign the user in — its `userId` is
 * client-supplied. Sessions are only ever minted by a magic-link sign-in, so
 * called directly this is a harmless idempotent enroll that grants no session.
 */
export async function completeAssessmentSetup(
  _prev: LinusState,
  formData: FormData,
): Promise<LinusState> {
  const userId = String(formData.get("userId") ?? "").trim();
  return registerAndEnrollUserById(userId);
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
 * route. Auth is the signed-in session: the report is fetched under the session
 * user's own participantId, so a user can only read their own report.
 */
export async function getReportPdf(enrollmentId: string): Promise<ReportResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const [user] = await db
    .select({
      participantId: users.linusParticipantId,
      firstName: users.firstName,
      lastName: users.lastName,
      patientIdentification: users.patientIdentification,
      patientFirstName: users.patientFirstName,
      patientLastName: users.patientLastName,
    })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  if (!user?.participantId) {
    return {
      status: "error",
      message: "We couldn't find an assessment account for you yet.",
    };
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
  // Name the file after whoever the report is about, which is not always the
  // person downloading it. On a "Someone else" booking Linus registered the
  // patient as the subject (see buildRegisterInput), so the buyer's name here
  // would put the wrong person on a clinical PDF.
  const isForSomeoneElse = user.patientIdentification === "Someone else";
  const subjectName =
    isForSomeoneElse && user.patientFirstName && user.patientLastName
      ? `${user.patientFirstName} ${user.patientLastName}`
      : `${user.firstName} ${user.lastName}`;
  const filename =
    slugify([subjectName, campaignKey, "brain health report"]
      .filter(Boolean)
      .join(" ")) + ".pdf";

  return { status: "ready", dataBase64, filename };
}
