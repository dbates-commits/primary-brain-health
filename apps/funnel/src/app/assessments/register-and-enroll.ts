/**
 * Core register / enroll / list logic, shared by the manual `/assessments` form
 * action, the payment step's server action, and the `/assessments` page. Kept
 * out of the `"use server"` actions file so a Server Component can import and
 * await it directly. Server-only (touches the DB and the Linus client).
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { linusEnrollments, users, type User } from "@/db/schema";
import { isPgError, PgErrorCode } from "@/lib/db-errors";
import {
  buildRegisterInput,
  MissingDateOfBirthError,
} from "@/lib/linus/build-register-input";
import {
  enrollSubject,
  extractReportData,
  getReport,
  LinusApiError,
  listEnrollments,
  registerSubject,
} from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/env";

/** Cookie set on successful payment so `/assessments` knows whose links to show. */
export const ASSESSMENT_UID_COOKIE = "pbh_assessment_uid";

/**
 * Per-card state:
 * - `available`     — not started / in progress; show "Start Assessment" (`redirect`).
 * - `report_pending`— completed, but the report hasn't been generated yet.
 * - `report_ready`  — completed and the report is available (`reportUrl`).
 */
export type EnrollmentStatus = "available" | "report_pending" | "report_ready";

export interface EnrollmentView {
  key: string;
  name: string;
  campaignId: string;
  enrollmentId: string;
  /** Latest assessment link; only meaningful when `status === "available"`. */
  redirect: string;
  status: EnrollmentStatus;
  /** Optional display fields, sourced from the campaign config. */
  description?: string;
  duration?: string;
  infoUrl?: string;
  /** Report route URL; set only when `status === "report_ready"`. */
  reportUrl?: string;
}

export type LinusState =
  | { status: "idle" }
  | {
      status: "success";
      email: string;
      firstName: string;
      participantId: string;
      enrollments: EnrollmentView[];
    }
  | { status: "error"; email: string; message: string };

/**
 * Probe one enrollment's report. Returns a same-origin URL that streams the PDF
 * (so the card's "View Report" button can open it in a new tab) when a report is
 * ready, else undefined. Never throws — a missing report (404) or any error just
 * means "not available yet".
 */
async function getReportUrl(
  participantId: string,
  enrollmentId: string,
): Promise<string | undefined> {
  try {
    const report = await getReport(participantId, enrollmentId, "patient-report");
    return extractReportData(report)
      ? `/assessments/report/${encodeURIComponent(enrollmentId)}`
      : undefined;
  } catch {
    // A 400/404 here just means the report isn't ready yet (the assessment
    // hasn't been completed) — expected, so swallow it and report "not ready".
    return undefined;
  }
}

/** Load the stored enrollment rows for a user, keyed by campaignId. */
async function loadEnrollmentRows(
  userId: string,
): Promise<Map<string, typeof linusEnrollments.$inferSelect>> {
  const rows = await db
    .select()
    .from(linusEnrollments)
    .where(eq(linusEnrollments.userId, userId));
  return new Map(rows.map((row) => [row.campaignId, row]));
}

/** Upsert the latest enrollmentId + redirect for a (user, campaign). */
async function upsertEnrollmentRow(
  userId: string,
  campaignId: string,
  enrollmentId: string,
  redirect: string,
): Promise<void> {
  await db
    .insert(linusEnrollments)
    .values({ userId, campaignId, enrollmentId, redirect })
    .onConflictDoUpdate({
      target: [linusEnrollments.userId, linusEnrollments.campaignId],
      set: { enrollmentId, redirect },
    });
}

/** Flag a (user, campaign) enrollment as having a report — we stop POSTing then. */
async function markReportReady(
  userId: string,
  campaignId: string,
): Promise<void> {
  await db
    .update(linusEnrollments)
    .set({ hasReport: true })
    .where(
      and(
        eq(linusEnrollments.userId, userId),
        eq(linusEnrollments.campaignId, campaignId),
      ),
    );
}

/** Turn a Linus/config error into a user-facing message. */
function describeError(err: unknown, action: string): string {
  if (err instanceof LinusApiError) {
    return `Couldn't ${action} with Linus (status ${err.status}). Please try again.`;
  }
  if (err instanceof Error) {
    // Config "not configured" and other Error messages are safe to surface.
    return err.message;
  }
  return `Unexpected error trying to ${action}.`;
}

/**
 * Register a known user as a Linus subject if we haven't already, then enroll
 * them in every configured campaign and return the enrollment redirect links.
 * Never throws — failures come back as an error state.
 *
 * `allowRegister` gates creating a brand-new Linus subject. The payment step
 * passes it (true) so registration happens exactly once, on successful payment;
 * read paths (e.g. the /assessments load) pass false so they never create a
 * subject — if there's no stored participantId they just surface an error.
 */
export async function registerAndEnrollUser(
  user: User,
  { allowRegister = true }: { allowRegister?: boolean } = {},
): Promise<LinusState> {
  const email = user.email;

  // Register once, then reuse the stored participant id on every later visit.
  let participantId = user.linusParticipantId;
  if (!participantId) {
    if (!allowRegister) {
      return {
        status: "error",
        email,
        message: "You're not registered for any assessments yet.",
      };
    }
    try {
      const subject = await registerSubject(buildRegisterInput(user));
      participantId = subject.participantId;
    } catch (err) {
      if (err instanceof MissingDateOfBirthError) {
        return { status: "error", email, message: err.message };
      }
      return { status: "error", email, message: describeError(err, "register") };
    }

    try {
      await db
        .update(users)
        .set({ linusParticipantId: participantId })
        .where(eq(users.id, user.id));
    } catch (err) {
      // Concurrent double-submit may have already stored an id. The column is
      // unique, so re-read and keep going rather than failing the request.
      if (!isPgError(err, PgErrorCode.UniqueViolation)) {
        throw err;
      }
      const [fresh] = await db
        .select({ linusParticipantId: users.linusParticipantId })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      if (fresh?.linusParticipantId) {
        participantId = fresh.linusParticipantId;
      }
    }
  }

  try {
    const enrollments = await resolveEnrollments(user.id, participantId);
    return {
      status: "success",
      email,
      firstName: user.firstName,
      participantId,
      enrollments,
    };
  } catch (err) {
    return { status: "error", email, message: describeError(err, "enroll") };
  }
}

/**
 * Resolve every configured campaign into an EnrollmentView, persisting state so
 * we never re-POST a completed enrollment (which would mint a new one and orphan
 * its report). Per campaign:
 *  1. stored hasReport → show report, no POST / no GET list.
 *  2. else probe the stored enrollment's report → if ready, flag + show report.
 *  3. else, if the stored enrollment is still active → POST to refresh the link.
 *     If it's no longer active (completed, report still generating) → don't POST.
 *  4. no stored row → POST and insert.
 */
async function resolveEnrollments(
  userId: string,
  participantId: string,
): Promise<EnrollmentView[]> {
  const campaigns = getCampaigns();
  const rows = await loadEnrollmentRows(userId);

  // The active-enrollment set is only needed (and only fetched) when a stored
  // enrollment has no report yet — fetched lazily, at most once per request.
  let activeIds: Set<string> | null = null;
  const getActiveIds = async (): Promise<Set<string>> => {
    if (activeIds === null) {
      const active = await listEnrollments(participantId);
      activeIds = new Set(active.map((e) => e.enrollmentId));
    }
    return activeIds;
  };

  const enrollments: EnrollmentView[] = [];
  for (const campaign of campaigns) {
    const base = {
      key: campaign.key,
      name: campaign.name,
      campaignId: campaign.campaignId,
      description: campaign.description,
      duration: campaign.duration,
      infoUrl: campaign.infoUrl,
    };
    const row = rows.get(campaign.campaignId);

    // (1) Already known complete with a report — never POST again.
    if (row?.hasReport) {
      enrollments.push({
        ...base,
        enrollmentId: row.enrollmentId,
        redirect: row.redirect,
        status: "report_ready",
        reportUrl: `/assessments/report/${encodeURIComponent(row.enrollmentId)}`,
      });
      continue;
    }

    if (row) {
      // (2) Probe the stored (possibly just-completed) enrollment for a report.
      const reportUrl = await getReportUrl(participantId, row.enrollmentId);
      if (reportUrl) {
        await markReportReady(userId, campaign.campaignId);
        enrollments.push({
          ...base,
          enrollmentId: row.enrollmentId,
          redirect: row.redirect,
          status: "report_ready",
          reportUrl,
        });
        continue;
      }

      // (3) No report yet. Is the stored enrollment still active?
      const active = await getActiveIds();
      if (!active.has(row.enrollmentId)) {
        // Completed, but the report hasn't generated yet. Do NOT re-POST — that
        // would create a new active enrollment and orphan the pending report.
        enrollments.push({
          ...base,
          enrollmentId: row.enrollmentId,
          redirect: row.redirect,
          status: "report_pending",
        });
        continue;
      }
      // Still active → refresh the link (idempotent: returns the same active
      // enrollment with a fresh redirect).
      const enrollment = await enrollSubject(participantId, campaign.campaignId);
      await upsertEnrollmentRow(
        userId,
        campaign.campaignId,
        enrollment.enrollmentId,
        enrollment.redirect,
      );
      enrollments.push({
        ...base,
        enrollmentId: enrollment.enrollmentId,
        redirect: enrollment.redirect,
        status: "available",
      });
      continue;
    }

    // (4) First time for this campaign → enroll and store.
    const enrollment = await enrollSubject(participantId, campaign.campaignId);
    await upsertEnrollmentRow(
      userId,
      campaign.campaignId,
      enrollment.enrollmentId,
      enrollment.redirect,
    );
    enrollments.push({
      ...base,
      enrollmentId: enrollment.enrollmentId,
      redirect: enrollment.redirect,
      status: "available",
    });
  }

  return enrollments;
}

/** Look up a user by email, then register + enroll (manual form path). */
export async function runRegisterAndEnroll(
  rawEmail: string,
): Promise<LinusState> {
  const email = rawEmail.trim();
  if (!email) {
    return { status: "error", email, message: "Enter an email address." };
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) {
    return {
      status: "error",
      email,
      message: "No account was found for that email address.",
    };
  }
  return registerAndEnrollUser(user);
}

/**
 * Look up a user by id, then register + enroll. The payment step calls this with
 * the default (registration allowed); the /assessments load passes
 * `allowRegister: false` so it never creates a subject — registration is gated
 * to a successful payment.
 */
export async function registerAndEnrollUserById(
  userId: string,
  options: { allowRegister?: boolean } = {},
): Promise<LinusState> {
  if (!userId) {
    return {
      status: "error",
      email: "",
      message: "We couldn't find your account.",
    };
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return {
      status: "error",
      email: "",
      message: "We couldn't find your account.",
    };
  }
  return registerAndEnrollUser(user, options);
}

