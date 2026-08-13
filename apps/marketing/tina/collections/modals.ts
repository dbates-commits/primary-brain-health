import type { Collection, TinaField } from "tinacms";
import { noClinicalVocabulary } from "../fields/no-clinical-vocabulary";
import { consentTermsVersion } from "../fields/consent-terms-version";

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
/**
 * The heading fields every step shares. Split out so the consent step can add
 * its agreement to them without the other three carrying a legal-terms field
 * they would never fill in.
 */
const HEADER_FIELDS: TinaField[] = [
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
      "How this step is listed here, e.g. \u201C3 \u00B7 Consent\u201D. Never shown to a customer.",
  },
  {
    name: "title",
    label: "Title",
    type: "string",
    description:
      "The big heading at the top of this step. Leave empty to keep the wording that ships in code \u2014 the preview beside this form shows you what that is. It may not use clinical words (consultation, diagnosis, treatment, specialist, physician, clinician, neurologist, prescription): this is a wellness assessment, and saving is blocked if it does.",
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
];

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
  templates: [
    {
      name: "step",
      label: "Step",
      fields: HEADER_FIELDS,
    },
    {
      name: "consentStep",
      label: "Consent step",
      fields: [
        ...HEADER_FIELDS,
        {
          name: "terms",
          label: "Consent terms",
          type: "rich-text",
          description:
            "The agreement shown in the scrolling box on this step, which a customer must accept before paying. Markdown: headings, bold, lists and links. Leave it empty and the terms that ship in code are shown instead.",
          // No banned-terms guard here, unlike the headings above. Legal text
          // needs the clinical words precisely to disclaim them — "this is not
          // medical treatment", "we do not provide a diagnosis" — which is the
          // same reason banned-terms.ts carves out the bare word "medical".
        },
        {
          name: "termsVersion",
          label: "Consent terms version",
          type: "string",
          description:
            "Stamped on every consent record as proof of WHICH terms that customer agreed to, so change it whenever you change the terms above \u2014 a date like 2026-08-13 is ideal. Leave it empty and consents are recorded against the version that ships in code. Existing records are never rewritten.",
          ui: { validate: consentTermsVersion },
        },
      ],
    },
  ],
};
