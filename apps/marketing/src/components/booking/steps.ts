/**
 * The booking modal's steps, and the shape of the CMS copy that titles them.
 *
 * The single source for the step set: the flow walks this array, the Modals
 * collection has one document per entry (named for it), the preview route
 * validates its URL segment against it, and the content test asserts the
 * documents on disk match it exactly.
 *
 * Deliberately imports nothing. The Node-side content sweep
 * (`content/modal-copy.test.ts`) imports this by relative path, where the `@/*`
 * alias and anything pulling in React are both unavailable.
 */
export const MODAL_STEPS = ["confirm", "details", "consent", "payment"] as const;

export type ModalStep = (typeof MODAL_STEPS)[number];

export function isModalStep(value: string): value is ModalStep {
  return (MODAL_STEPS as readonly string[]).includes(value);
}

/**
 * One `modal` document as Tina returns it. Every field is nullable: a document
 * starts with nothing but its admin label, and empty means "use the copy that
 * ships in code".
 *
 * Structurally the generated `ModalParts`, redeclared here so this module stays
 * free of generated types that are rebuilt on every schema change.
 */
export interface ModalStepCopy {
  /**
   * Stamped onto every non-scalar in a `useTina` result; it is what `tinaField`
   * turns into a click-to-edit target. Declared rather than cast away at the
   * call site, because its presence is what makes the document editable.
   */
  _content_source?: { queryId: string; path: (number | string)[] };
  title?: string | null;
  subtitle?: string | null;
}

/** The four documents, keyed by step. Absent keys fall back to the code copy. */
export type ModalStepCopyMap = Partial<Record<ModalStep, ModalStepCopy | null>>;
