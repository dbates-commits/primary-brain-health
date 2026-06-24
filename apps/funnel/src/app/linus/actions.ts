"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { isPgError, PgErrorCode } from "@/lib/db-errors";
import {
  buildRegisterInput,
  MissingDateOfBirthError,
} from "@/lib/linus/build-register-input";
import { enrollSubject, LinusApiError, registerSubject } from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/env";

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
 * Register the user (identified by email) as a Linus subject if we haven't
 * already, then enroll them in every configured campaign and return the
 * enrollment redirect links.
 */
export async function registerAndEnroll(
  _prev: LinusState,
  formData: FormData,
): Promise<LinusState> {
  const email = String(formData.get("email") ?? "").trim();
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
