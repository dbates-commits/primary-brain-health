import type { NodeState } from "./process-model";

/**
 * The one place a state becomes a colour.
 *
 * Tokens only — stock Tailwind colours are switched off in `@pbh/tokens`, so
 * `border-slate-400` would emit nothing at all.
 */
export const STATE_BORDER: Record<NodeState, string> = {
  built: "border-grey-400",
  planned: "border-aqua-default",
  blocked: "border-error",
};

export const STATE_TEXT: Record<NodeState, string> = {
  built: "text-text-heading",
  planned: "text-aqua-default",
  blocked: "text-error",
};

export const STATE_DOT: Record<NodeState, string> = {
  built: "bg-grey-400",
  planned: "bg-aqua-default",
  blocked: "bg-error",
};
