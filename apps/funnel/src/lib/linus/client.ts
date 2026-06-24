/**
 * Server-only client for the Linus Health Public API. Modeled on the marketing
 * app's HubSpot client (thin fetch wrapper + custom error + module-level env).
 *
 * Auth is OAuth2 client-credentials: we POST our client id/secret to Linus's
 * token endpoint, get a short-lived Bearer token, and attach it to each call.
 * The token is cached in-module (best-effort, per warm serverless instance) so
 * a burst of requests reuses one token instead of minting one per call.
 *
 * IMPORTANT: this module reads `LINUS_CLIENT_SECRET` and holds the Bearer
 * token, so it must only ever be imported from server code (Server Components,
 * server actions, route handlers) — never from a client component.
 */

import { getLinusConfig } from "./env";
import type {
  Enrollment,
  RegisterSubjectInput,
  ReportType,
  Subject,
} from "./types";

export class LinusApiError extends Error {
  status: number;
  /** Raw response body — never includes our token. */
  body: string;
  constructor(status: number, body: string, context: string) {
    super(`Linus API request failed (${context}, status ${status})`);
    this.status = status;
    this.body = body;
  }
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;
/** Refresh this far before actual expiry to avoid using a just-expired token. */
const TOKEN_EXPIRY_SAFETY_MS = 60_000;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EXPIRY_SAFETY_MS > Date.now()) {
    return cachedToken.accessToken;
  }

  const config = getLinusConfig();
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: config.audience,
    }),
    // Never cache a credentialed token response.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new LinusApiError(res.status, body, "oauth token");
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function linusRequest<T>(
  path: string,
  init: RequestInit,
  context: string,
): Promise<T> {
  const config = getLinusConfig();
  const token = await getAccessToken();
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new LinusApiError(res.status, body, context);
  }
  return (await res.json()) as T;
}

/** `POST /v1/participants` — register a subject. */
export async function registerSubject(
  input: RegisterSubjectInput,
): Promise<Subject> {
  return linusRequest<Subject>(
    "/participants",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "register subject",
  );
}

/**
 * `POST /v1/participants/{id}/enrollments` — enroll a subject in a campaign.
 * Idempotent server-side: if an active enrollment already exists for the
 * campaign, Linus returns that existing enrollment instead of creating a new one.
 */
export async function enrollSubject(
  participantId: string,
  campaignId: string,
): Promise<Enrollment> {
  return linusRequest<Enrollment>(
    `/participants/${encodeURIComponent(participantId)}/enrollments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, campaignId, consent: true }),
    },
    "enroll subject",
  );
}

/**
 * `GET /v1/participants/{id}/enrollments` — list a subject's active (not yet
 * completed) enrollments and their redirect links. Read-only; safe to call when
 * rendering a page.
 */
export async function listEnrollments(
  participantId: string,
): Promise<Enrollment[]> {
  return linusRequest<Enrollment[]>(
    `/participants/${encodeURIComponent(participantId)}/enrollments`,
    { method: "GET" },
    "list enrollments",
  );
}

/**
 * `GET /v1/participants/{id}/enrollments/{enrollmentId}/reports/{reportType}` —
 * retrieve a results report (base64-encoded PDF). Wrapped for completeness;
 * no UI uses it yet (reports only exist once a subject finishes the assessment).
 */
export async function getReport(
  participantId: string,
  enrollmentId: string,
  reportType: ReportType,
): Promise<unknown> {
  return linusRequest<unknown>(
    `/participants/${encodeURIComponent(participantId)}/enrollments/${encodeURIComponent(
      enrollmentId,
    )}/reports/${reportType}`,
    { method: "GET" },
    "get report",
  );
}
