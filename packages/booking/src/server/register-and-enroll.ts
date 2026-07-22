import "server-only";

/**
 * Core register / enroll / list logic, shared by the funnel `/login` sign-in
 * action, both apps' payment step actions, and the `/assessments` page. Server-
 * only (touches the DB and the Linus client).
 */

import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db, linusEnrollments, users, type User } from "@pbh/db";
import {
  buildRegisterInput,
  enrollSubject,
  extractReportData,
  getCampaigns,
  getReport,
  LinusApiError,
  listEnrollments,
  MissingDateOfBirthError,
  registerSubject,
} from "@pbh/linus";
import { isPgError, PgErrorCode } from "./db-errors";
import {
  sendAssessmentReadyEmail,
  sendReportReadyEmail,
} from "./send-email";

/**
 * Per-card state:
 * - `available`     — not started / in progress; show "Start Assessment" (`redirect`).
 * - `report_pending`— completed, but the report hasn't been generated yet.
 * - `report_ready`  — completed and the report is available ("View Report").
 * - `completed`     — finished, with no report expected (campaign `producesReport: false`).
 */
export type EnrollmentStatus =
  | "available"
  | "report_pending"
  | "report_ready"
  | "completed";

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
 * Probe whether one enrollment's report is ready. The PDF itself is fetched on
 * demand by the `getReportPdf` server action when the user clicks "View Report";
 * here we only need a boolean to drive the card's status. Never throws — a
 * missing report (404) or any error just means "not available yet".
 */
async function hasReadyReport(
  participantId: string,
  enrollmentId: string,
): Promise<boolean> {
  try {
    const report = await getReport(participantId, enrollmentId, "patient-report");
    return extractReportData(report) !== undefined;
  } catch {
    // A 400/404 here just means the report isn't ready yet (the assessment
    // hasn't been completed) — expected, so swallow it and report "not ready".
    return false;
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
 * How long a registration claim is honored before it's considered stale and can
 * be re-claimed. Bounds recovery if a winner crashes after claiming but before
 * it stores the participant id — the next attempt re-claims and registers.
 */
const REGISTRATION_CLAIM_STALE = "30 seconds";

/**
 * Atomically elect a single registrar for a first-time subject. The client
 * action and the webhook run in separate instances, so an in-process lock can't
 * serialize them — this single-statement compare-and-set in Postgres does (which
 * the neon-http driver supports; only *cross-statement* locks are unavailable).
 *
 * Returns true iff this caller won the right to call Linus. The claim only
 * applies while `linus_participant_id IS NULL`, so once anyone registers no one
 * re-claims; the staleness window lets a crashed winner's claim be retried.
 */
async function claimLinusRegistration(userId: string): Promise<boolean> {
  const [row] = await db
    .update(users)
    .set({ linusRegistrationClaimedAt: sql`now()` })
    .where(
      and(
        eq(users.id, userId),
        isNull(users.linusParticipantId),
        or(
          isNull(users.linusRegistrationClaimedAt),
          lt(
            users.linusRegistrationClaimedAt,
            sql`now() - interval '${sql.raw(REGISTRATION_CLAIM_STALE)}'`,
          ),
        ),
      ),
    )
    .returning({ id: users.id });
  return Boolean(row);
}

/**
 * Release a registration claim (only while still unregistered) so a retry can
 * re-claim immediately instead of waiting out the staleness window. Called when
 * the Linus register call itself fails.
 */
async function releaseLinusRegistrationClaim(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ linusRegistrationClaimedAt: null })
    .where(and(eq(users.id, userId), isNull(users.linusParticipantId)));
}

/** Read the currently-stored Linus participant id for a user (or null). */
async function readParticipantId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ linusParticipantId: users.linusParticipantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.linusParticipantId ?? null;
}

/**
 * Persist the participant id, returning the id now in effect. The registration
 * claim already makes us the only registrar, so a unique violation shouldn't
 * happen; if it somehow does, fall back to whatever id is already stored. Any
 * other DB error is thrown for the caller to turn into an error state.
 */
async function storeParticipantId(
  userId: string,
  participantId: string,
): Promise<string> {
  try {
    await db
      .update(users)
      .set({ linusParticipantId: participantId })
      .where(eq(users.id, userId));
    return participantId;
  } catch (err) {
    if (!isPgError(err, PgErrorCode.UniqueViolation)) {
      throw err;
    }
    return (await readParticipantId(userId)) ?? participantId;
  }
}

/**
 * Outcome of ensuring a first-time user is registered as a Linus subject:
 * - `registered` — a participant id is available (we registered, or a concurrent
 *   winner already stored one).
 * - `deferred`   — a concurrent winner is still registering and the caller chose
 *   not to retry; enrollment should be deferred (see `retryOnContention`).
 * - `error`      — registration failed (or the caller chose to retry on
 *   contention, so the webhook redelivers).
 */
type RegistrationOutcome =
  | { type: "registered"; participantId: string }
  | { type: "deferred" }
  | { type: "error"; message: string };

/**
 * Register a first-time user as a Linus subject exactly once, even when the
 * client action and the webhook race (they run in separate instances). We elect
 * one registrar with an atomic DB claim; only the winner calls Linus.
 *
 * `retryOnContention` decides what a loser does while the winner is still
 * in flight: the webhook passes `true` (return an error → Stripe redelivers and
 * retries until the id lands), the client passes `false` (defer — see the
 * `deferred` outcome — so a charge that actually went through never shows an
 * error).
 */
async function ensureRegistered(
  user: User,
  retryOnContention: boolean,
): Promise<RegistrationOutcome> {
  // Losers don't call Linus. If the winner already stored an id, reuse it;
  // otherwise it's still in flight.
  if (!(await claimLinusRegistration(user.id))) {
    const existing = await readParticipantId(user.id);
    if (existing) {
      return { type: "registered", participantId: existing };
    }
    return retryOnContention
      ? { type: "error", message: "Registration is already in progress; will retry." }
      : { type: "deferred" };
  }

  // We won the claim — register the subject, then store its id.
  let participantId: string;
  try {
    const subject = await registerSubject(buildRegisterInput(user));
    participantId = subject.participantId;
  } catch (err) {
    // Free the claim so a retry can re-register immediately, not after the
    // staleness window.
    await releaseLinusRegistrationClaim(user.id).catch(() => {});
    const message =
      err instanceof MissingDateOfBirthError
        ? err.message
        : describeError(err, "register");
    return { type: "error", message };
  }

  try {
    return {
      type: "registered",
      participantId: await storeParticipantId(user.id, participantId),
    };
  } catch (err) {
    return { type: "error", message: describeError(err, "register") };
  }
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
 *
 * `retryOnContention` is forwarded to `ensureRegistered` to pick the loser
 * behavior when two callers race on a first-time registration.
 */
export async function registerAndEnrollUser(
  user: User,
  {
    allowRegister = true,
    retryOnContention = false,
  }: { allowRegister?: boolean; retryOnContention?: boolean } = {},
): Promise<LinusState> {
  const email = user.email;

  // No campaigns configured for this environment (e.g. Production before its
  // campaign IDs are wired) means there's nothing to enroll in — don't create a
  // Linus subject just to land on an empty page. Surface the empty success state
  // and let the view show its "nothing configured yet" copy.
  if (getCampaigns().length === 0) {
    return {
      status: "success",
      email,
      firstName: user.firstName,
      participantId: user.linusParticipantId ?? "",
      enrollments: [],
    };
  }

  // Register once (the first visit), then reuse the stored id on every later one.
  let participantId = user.linusParticipantId;
  if (!participantId) {
    if (!allowRegister) {
      return {
        status: "error",
        email,
        message: "You're not registered for any assessments yet.",
      };
    }

    const outcome = await ensureRegistered(user, retryOnContention);
    if (outcome.type === "error") {
      return { status: "error", email, message: outcome.message };
    }
    if (outcome.type === "deferred") {
      // The charge succeeded but a concurrent caller is still registering. Return
      // success now (no payment error); /assessments enrolls once the id lands.
      return {
        status: "success",
        email,
        firstName: user.firstName,
        participantId: "",
        enrollments: [],
      };
    }
    participantId = outcome.participantId;
  }

  try {
    const { enrollments, firstResolution } = await resolveEnrollments(
      user.id,
      participantId,
    );
    if (firstResolution && enrollments.length > 0) {
      // First time this user's enrollments ever resolved → "ready to start".
      // Both racing paths (client action + webhook) can reach here in the same
      // instant and each see firstResolution — a duplicate email in that narrow
      // window is accepted (low harm; a DB send-guard isn't warranted yet).
      await sendAssessmentReadyEmail(
        user.id,
        enrollments.map((e) => ({ name: e.name, duration: e.duration })),
      );
    }
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
 *  3. else, if the stored enrollment is still active → serve the stored link
 *     (no re-POST: it would mint a new enrollment for a *started* assessment).
 *     If it's no longer active → "report_pending" (report still generating) or,
 *     for a campaign that produces no report, "completed". Either way, don't POST.
 *  4. no stored row → POST and insert.
 *
 * Campaigns with `producesReport: false` skip the report steps (1, 2) entirely —
 * their report endpoint 404s forever, so a completed enrollment settles into
 * "completed" rather than spinning on "report_pending".
 *
 * `firstResolution` is true when the user had no stored enrollment rows at all
 * before this call — the once-per-user signal the caller uses to send the
 * "assessment ready" email.
 */
async function resolveEnrollments(
  userId: string,
  participantId: string,
): Promise<{ enrollments: EnrollmentView[]; firstResolution: boolean }> {
  const campaigns = getCampaigns();
  const rows = await loadEnrollmentRows(userId);
  const firstResolution = rows.size === 0;

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
    // Defaults to false — only campaigns explicitly flagged `true` get a report.
    const producesReport = campaign.producesReport ?? false;

    // (1) Already known complete with a report — never POST again.
    if (producesReport && row?.hasReport) {
      enrollments.push({
        ...base,
        enrollmentId: row.enrollmentId,
        redirect: row.redirect,
        status: "report_ready",
      });
      continue;
    }

    if (row) {
      // (2) Probe the stored (possibly just-completed) enrollment for a report —
      // only for campaigns that actually produce one (others 404 forever).
      if (producesReport) {
        if (await hasReadyReport(participantId, row.enrollmentId)) {
          await markReportReady(userId, campaign.campaignId);
          // The hasReport flip above is once-only per (user, campaign), so this
          // sends exactly once. Today the transition is only ever detected
          // during an /assessments load (the user is already on the page); a
          // background poller should own this send when one exists.
          await sendReportReadyEmail(userId, campaign.name);
          enrollments.push({
            ...base,
            enrollmentId: row.enrollmentId,
            redirect: row.redirect,
            status: "report_ready",
          });
          continue;
        }
      }

      // (3) No report (or none expected). Is the stored enrollment still active?
      const active = await getActiveIds();
      if (!active.has(row.enrollmentId)) {
        // Finished. Do NOT re-POST — that would create a new active enrollment
        // and orphan the pending report. If the campaign produces a report it's
        // still generating; otherwise the assessment is simply complete.
        enrollments.push({
          ...base,
          enrollmentId: row.enrollmentId,
          redirect: row.redirect,
          status: producesReport ? "report_pending" : "completed",
        });
        continue;
      }
      // Still active (assigned or started). Serve the stored link as-is — do NOT
      // re-POST. Linus confirmed enrollSubject is idempotent only for *assigned*
      // enrollments; for a *started* one it mints a brand-new enrollment (new id
      // + link), orphaning the in-progress assessment and its eventual report.
      // The API exposes no status to tell the two apart, and the stored redirect
      // stays valid for the life of the enrollment, so we just reuse it.
      enrollments.push({
        ...base,
        enrollmentId: row.enrollmentId,
        redirect: row.redirect,
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

  return { enrollments, firstResolution };
}

/**
 * Look up a user by email, then enroll (the /login form path). Sign-in never
 * creates a Linus subject — registration is gated to a successful payment — so
 * we pass `allowRegister: false`. A user who hasn't paid gets the "not
 * registered for any assessments yet" error rather than being registered.
 */
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
  return registerAndEnrollUser(user, { allowRegister: false });
}

/**
 * Look up a user by id, then register + enroll. The payment step calls this with
 * the default (registration allowed); the /assessments load passes
 * `allowRegister: false` so it never creates a subject — registration is gated
 * to a successful payment.
 */
export async function registerAndEnrollUserById(
  userId: string,
  options: { allowRegister?: boolean; retryOnContention?: boolean } = {},
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
