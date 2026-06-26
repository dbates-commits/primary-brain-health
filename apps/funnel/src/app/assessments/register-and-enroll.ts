/**
 * Core register / enroll / list logic, shared by the manual `/assessments` form
 * action, the payment step's server action, and the `/assessments` page. Kept
 * out of the `"use server"` actions file so a Server Component can import and
 * await it directly. Server-only (touches the DB and the Linus client).
 */

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type User } from "@/db/schema";
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
  registerSubject,
} from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/env";

/** Cookie set on successful payment so `/assessments` knows whose links to show. */
export const ASSESSMENT_UID_COOKIE = "pbh_assessment_uid";

export interface EnrollmentView {
  key: string;
  name: string;
  campaignId: string;
  enrollmentId: string;
  redirect: string;
  /** Optional display fields, sourced from the campaign config. */
  description?: string;
  duration?: string;
  infoUrl?: string;
  /** Per-enrollment report route URL when a report is ready; else undefined. */
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
    // TODO(linus-debug): remove temporary report logging
    console.log(
      `[linus] report for enrollment ${enrollmentId}:`,
      JSON.stringify(report),
    );
    return extractReportData(report)
      ? `/assessments/report/${encodeURIComponent(enrollmentId)}`
      : undefined;
  } catch (err) {
    // TODO(linus-debug): remove temporary report logging
    console.log(
      `[linus] report for enrollment ${enrollmentId} unavailable:`,
      err instanceof LinusApiError ? `${err.status} ${err.body}` : err,
    );
    return undefined;
  }
}

/** Set `reportUrl` on each view in parallel from its enrollment's report. */
async function attachReportUrls(
  participantId: string,
  views: EnrollmentView[],
): Promise<void> {
  await Promise.all(
    views.map(async (view) => {
      view.reportUrl = await getReportUrl(participantId, view.enrollmentId);
    }),
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
 */
export async function registerAndEnrollUser(user: User): Promise<LinusState> {
  const email = user.email;

  // Register once, then reuse the stored participant id on every later visit.
  let participantId = user.linusParticipantId;
  if (!participantId) {
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
    const campaigns = getCampaigns();
    const enrollments: EnrollmentView[] = [];
    for (const campaign of campaigns) {
      // Idempotent: re-POSTing returns the existing active enrollment's link if
      // one is valid, or generates a fresh one — so we always get a usable
      // redirect without persisting (and risking) a stale link. (Per Linus:
      // GET .../enrollments does not return the redirect.)
      const enrollment = await enrollSubject(participantId, campaign.campaignId);
      enrollments.push({
        key: campaign.key,
        name: campaign.name,
        campaignId: campaign.campaignId,
        enrollmentId: enrollment.enrollmentId,
        redirect: enrollment.redirect,
        description: campaign.description,
        duration: campaign.duration,
        infoUrl: campaign.infoUrl,
      });
    }
    await attachReportUrls(participantId, enrollments);
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

/** Look up a user by id, then register + enroll (payment path). */
export async function registerAndEnrollUserById(
  userId: string,
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
  return registerAndEnrollUser(user);
}

