/**
 * Core register / enroll / list logic, shared by the manual `/assessments` form
 * action, the payment step's server action, and the `/assessments` page. Kept
 * out of the `"use server"` actions file so a Server Component can import and
 * await it directly. Server-only (touches the DB and the Linus client).
 */

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { linusEnrollments, users, type User } from "@/db/schema";
import { isPgError, PgErrorCode } from "@/lib/db-errors";
import {
  buildRegisterInput,
  MissingDateOfBirthError,
} from "@/lib/linus/build-register-input";
import {
  enrollSubject,
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
  redirect: string;
}

export type LinusState =
  | { status: "idle" }
  | {
      status: "success";
      email: string;
      participantId: string;
      enrollments: EnrollmentView[];
    }
  | { status: "error"; email: string; message: string };

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
      // Idempotent: returns the existing active enrollment if there is one.
      const enrollment = await enrollSubject(participantId, campaign.campaignId);
      // Persist the redirect now: the post-payment page reads it from here
      // rather than the list endpoint, which doesn't reliably return it.
      await db
        .insert(linusEnrollments)
        .values({
          userId: user.id,
          campaignId: campaign.campaignId,
          enrollmentId: enrollment.enrollmentId,
          redirect: enrollment.redirect,
        })
        .onConflictDoUpdate({
          target: [linusEnrollments.userId, linusEnrollments.campaignId],
          set: {
            enrollmentId: enrollment.enrollmentId,
            redirect: enrollment.redirect,
          },
        });
      enrollments.push({
        key: campaign.key,
        name: campaign.name,
        campaignId: campaign.campaignId,
        redirect: enrollment.redirect,
      });
    }
    return { status: "success", email, participantId, enrollments };
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

/**
 * Read-only: list a user's stored assessment links for display. Reads the
 * redirects we persisted at enroll time (not the Linus list endpoint, which
 * doesn't reliably return them) — the `/assessments` page uses this after
 * payment has already done the enrollment.
 */
export async function listAssessments(userId: string): Promise<LinusState> {
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
  if (!user.linusParticipantId) {
    return {
      status: "error",
      email: user.email,
      message: "You're not registered for any assessments yet.",
    };
  }

  try {
    const byCampaignId = new Map(
      getCampaigns().map((campaign) => [campaign.campaignId, campaign]),
    );
    const stored = await db
      .select()
      .from(linusEnrollments)
      .where(eq(linusEnrollments.userId, user.id));
    const views: EnrollmentView[] = stored.map((enrollment) => {
      const campaign = byCampaignId.get(enrollment.campaignId);
      return {
        key: campaign?.key ?? enrollment.campaignId,
        name: campaign?.name ?? "Assessment",
        campaignId: enrollment.campaignId,
        redirect: enrollment.redirect,
      };
    });
    return {
      status: "success",
      email: user.email,
      participantId: user.linusParticipantId,
      enrollments: views,
    };
  } catch (err) {
    return {
      status: "error",
      email: user.email,
      message: describeError(err, "load assessments"),
    };
  }
}
