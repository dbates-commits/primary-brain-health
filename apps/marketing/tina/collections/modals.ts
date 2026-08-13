import type { Collection } from "tinacms";
import { noClinicalVocabulary } from "../fields/no-clinical-vocabulary";

/**
 * The headers of the booking modal's four steps — one document per step.
 *
 * Clicking a step here opens `/internal/modals/<step>`, which renders that step
 * exactly as a customer sees it, beside this document's form. That route is the
 * reason the collection exists: three of the four steps sit behind a booking
 * cookie, a confirmed email address and a live Stripe session, so there is
 * otherwise no way for an editor to look at the screen they are editing.
 *
 * The set of steps is code-owned (`MODAL_STEPS` in
 * `src/components/booking/steps.ts`) and the filenames are what tie a document
 * to its step — hence no create, no delete, and no renaming.
 */
export const modalsCollection: Collection = {
  name: "modal",
  label: "Modals",
  path: "content/modals",
  format: "json",
  ui: {
    // `_sys.filename` IS the step id, so this needs no lookup table. Tina's
    // admin renders the route in an iframe beside the form.
    router: ({ document }) => `/internal/modals/${document._sys.filename}`,
    // Four steps, fixed. A fifth document would have no step to title and no
    // route to open; a missing one would break the flow it names.
    allowedActions: {
      create: false,
      delete: false,
      createFolder: false,
      createNestedFolder: false,
    },
    // A rename would silently break both the router and the runtime lookup,
    // which key off the filename.
    filename: { readonly: true },
    // Deliberately not `global: true`: a global form is skipped when Tina picks
    // the active form, and this document's form being the active one is the
    // entire point.
  },
  fields: [
    {
      name: "step",
      label: "Step",
      type: "string",
      required: true,
      // Both the label and the sort order in the collection list — Tina sorts
      // by the `isTitle` field, so numbering these gives flow order instead of
      // alphabetical (confirm, consent, details, payment).
      isTitle: true,
      description:
        "How this step is listed here, e.g. “3 · Consent”. Never shown to a customer.",
    },
    {
      name: "title",
      label: "Title",
      type: "string",
      description:
        "The big heading at the top of this step. Leave empty to keep the wording that ships in code — the preview beside this form shows you what that is. It may not use clinical words (consultation, diagnosis, treatment, specialist, physician, clinician, neurologist, prescription): this is a wellness assessment, and saving is blocked if it does.",
      ui: { validate: noClinicalVocabulary },
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "string",
      description:
        "The line under the heading. Leave empty for the code wording, or for no subtitle at all where the step ships without one.",
      ui: { component: "textarea", validate: noClinicalVocabulary },
    },
  ],
};
