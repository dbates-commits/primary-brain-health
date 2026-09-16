import "server-only";

import { eq } from "drizzle-orm";
import { db, users } from "@pbh/db";

/**
 * The booking flow's half of HubSpot: a contact created when the account is,
 * and flagged when it pays.
 *
 * **Separate from `lib/hubspot.ts` in the marketing app**, and deliberately so.
 * That one posts the consultation and contact forms to the public Forms
 * Submissions endpoint, which records a form submission on the contact's
 * timeline — the right shape for something a visitor actually filled in. Nobody
 * fills in a payment, so these writes go to the CRM object API instead, where
 * they read as what they are: properties set by a system.
 *
 * **Env-gated and never throwing**, the same contract as the Resend senders in
 * `send-email.ts`. With `HUBSPOT_PRIVATE_APP_TOKEN` unset every call is a
 * logged no-op, so signup and checkout work end-to-end with no HubSpot setup;
 * with it set, a HubSpot outage costs a CRM row, never a booking or a payment.
 * Callers should still `await` — on Vercel, work left running after the
 * response is frozen with the function.
 *
 * **PHI rule (AS5, compliance/discovery.md): event flags and cohort tags only.**
 * Name and email identify the contact and the two payment properties say what
 * happened commercially. Nothing from the details step — date of birth, gender,
 * education, ZIP — is sent here, and nothing about an assessment or its results
 * ever should be. HubSpot is not a Business Associate.
 */

/** Contact properties this module is allowed to write, by HubSpot internal name. */
interface ContactProperties {
  email?: string;
  firstname?: string;
  lastname?: string;
  /** Checkbox property. HubSpot takes booleans as the strings "true"/"false". */
  is_paying_customer?: "true" | "false";
  /** Date property, midnight UTC. HubSpot accepts a plain `YYYY-MM-DD`. */
  paid_on_date?: string;
}

function privateAppToken(): string | null {
  // `||`, not `??`: the var ships as an empty string in .env.example and in
  // every Vercel scope that hasn't been given a real token yet.
  return process.env.HUBSPOT_PRIVATE_APP_TOKEN || null;
}

/**
 * Create or update the contact for `email`.
 *
 * One call, not a lookup and then a write: the batch upsert endpoint keyed on
 * `email` is what makes this safe to run twice, which it routinely is — a
 * customer who signs up, abandons, and comes back lands here again, and the
 * payment path can be reached by both the client confirm and the webhook.
 *
 * Only ever adds or overwrites the properties named; a HubSpot field this
 * module doesn't know about is left alone, so anything a marketer has set by
 * hand survives.
 */
async function upsertContact(
  email: string,
  properties: ContactProperties,
  context: string,
): Promise<void> {
  const token = privateAppToken();
  if (!token) {
    console.info(
      `[hubspot] HUBSPOT_PRIVATE_APP_TOKEN unset — skipping ${context} for a contact.`,
    );
    return;
  }
  if (!email) {
    console.error(`[hubspot] ${context} reached with no email; skipping.`);
    return;
  }

  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [{ idProperty: "email", id: email, properties }],
        }),
      },
    );
    if (!res.ok) {
      // The body carries HubSpot's own reason (a missing property, a revoked
      // token) and nothing about the customer beyond what we just sent.
      const body = await res.text().catch(() => "");
      console.error(
        `[hubspot] ${context} rejected (status ${res.status}):`,
        body.slice(0, 500),
      );
    }
  } catch (err) {
    console.error(`[hubspot] ${context} failed:`, err);
  }
}

/**
 * Create the contact at signup, before there is any payment to report.
 *
 * Takes the values rather than a user id: `createAccountCore` has just written
 * them and a second read would only be a slower way to learn the same thing.
 */
export async function createHubSpotContactAtSignup(contact: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  await upsertContact(
    contact.email,
    {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
    },
    "signup contact create",
  );
}

/**
 * Flag the contact as paying, once.
 *
 * Called from the first effective write in `recordSucceededPayment`, which is
 * the exactly-once point across the racing client-confirm and webhook paths —
 * the same gate the receipt email uses. The upsert would be harmless run twice
 * anyway; what it would not be is honest about `paid_on_date`, which must stay
 * the date of the first payment rather than the date of the last redelivery.
 *
 * The address comes from the `users` row, not from Stripe: the Stripe customer
 * may carry an address the customer typed at checkout, and the CRM contact is
 * keyed on the one they signed up with.
 */
export async function markHubSpotContactPaid(
  userId: string,
  paidAt: Date,
): Promise<void> {
  const [row] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.email) {
    console.error(
      "[hubspot] paid flag skipped — no user row or no email for",
      userId,
    );
    return;
  }

  await upsertContact(
    row.email,
    {
      is_paying_customer: "true",
      // A HubSpot date property stores midnight UTC, so the date is taken in
      // UTC too. For a late-evening US payment that is tomorrow's date — the
      // alternative is picking a display timezone here, which is a reporting
      // decision and belongs in HubSpot, not in the write.
      paid_on_date: paidAt.toISOString().slice(0, 10),
    },
    "paid flag",
  );
}
