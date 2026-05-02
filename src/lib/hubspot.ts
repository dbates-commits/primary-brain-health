/**
 * Thin client over HubSpot's "Forms Submissions" v3 endpoint:
 *   POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
 *
 * No auth header — the endpoint is public, scoped per portal+form GUID.
 * On success HubSpot creates/updates the contact and fires any workflows
 * the form is bound to. The response surface tells us nothing useful, so
 * we only care about non-2xx status codes.
 *
 * Routes that call submitHubSpotForm should pre-filter empty values; the
 * API rejects the submission entirely if any required field is missing,
 * but it is fine with omitted optional ones.
 */

export interface HubSpotField {
  name: string;
  value: string;
}

export interface SubmitContext {
  /** Absolute URL of the page that produced the submission. */
  pageUri?: string;
  /** Human-readable page name. */
  pageName?: string;
}

interface SubmitArgs {
  portalId: string;
  formGuid: string;
  fields: HubSpotField[];
  context?: SubmitContext;
}

export class HubSpotSubmitError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`HubSpot rejected submission (status ${status})`);
    this.status = status;
    this.body = body;
  }
}

export async function submitHubSpotForm({
  portalId,
  formGuid,
  fields,
  context,
}: SubmitArgs): Promise<void> {
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: fields.filter((f) => f.value !== "" && f.value != null),
      ...(context && { context }),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new HubSpotSubmitError(res.status, body);
  }
}

export const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID ?? "";
export const HUBSPOT_INTAKE_FORM_GUID =
  process.env.HUBSPOT_INTAKE_FORM_GUID ?? "";
export const HUBSPOT_CONTACT_FORM_GUID =
  process.env.HUBSPOT_CONTACT_FORM_GUID ?? "";
