/**
 * The customer journey as a BPMN-ish process map, in types.
 *
 * Deliberately client-safe and dependency-free: nothing here imports from
 * `packages/booking/src/server/`, which is `"server-only"`. The step names are
 * redeclared rather than reused for exactly that reason — the same trade
 * `components/booking/step-model.ts` makes against `BookingResumeStep`.
 */

/** The systems a step can reach out to. Ours plus the four vendors. */
export type SystemId = "neon" | "resend" | "stripe" | "linus" | "authjs";

export type NodeKind = "start" | "end" | "user" | "service" | "gateway-xor" | "gateway-and";

/**
 * Whether the step runs today.
 *
 * `blocked` is not "broken" — it is a step that exists in the journey with
 * nothing behind it (the two dead CTAs on `/welcome`), or a guard the flow
 * assumes and does not have. `planned` is work asked for and not started.
 */
export type NodeState = "built" | "planned" | "blocked";

export type LaneId = "marketing" | "booking" | "payment" | "after";

export type Owner = {
  /** Workspace package or app the step belongs to. */
  package: string;
  /** The file a reader should open first. Repo-relative. */
  file: string;
  team: string;
};

export type ProcessNode = {
  id: string;
  kind: NodeKind;
  /** Absent means the partner pool below the lanes. */
  lane?: LaneId;
  name: string;
  description: string;
  systems: SystemId[];
  /** What it writes down — Neon tables, audit rows, cookies. */
  writes: string[];
  /** Email templates it sends. */
  sends: string[];
  owner: Owner;
  failure?: string;
  state: NodeState;
  /**
   * Work asked for on a step that otherwise runs today — rendered behind a ◇,
   * as on the Figma board. A node carrying one counts as planned for the
   * filter, which is why {@link isPlanned} exists rather than a bare
   * `state === "planned"` test.
   */
  plannedNote?: string;
  /** Hand-placed: a process map reads left to right, so no auto-layout. */
  x: number;
  y: number;
};

/**
 * How a flow is drawn.
 *
 * `wrap` is the jump from the end of one lane to the start of the next, `loop`
 * is a path back to a step already passed, and `async` is work that runs beside
 * the customer rather than after them. All three move in dashes — each is a
 * line the eye would otherwise try to read as the next step along.
 */
export type EdgeKind = "wrap" | "loop" | "async";

export type ProcessEdge = {
  from: string;
  to: string;
  label?: string;
  kind?: EdgeKind;
  /**
   * For a `wrap` or `loop`: the y its horizontal leg runs along. Chosen by hand
   * in `process-data.ts` so the line travels a corridor between the bands
   * rather than the midpoint `smoothstep` would pick, which is inside a row.
   */
  via?: number;
};

export type Lane = {
  id: LaneId;
  label: string;
  y: number;
  height: number;
};

export const SYSTEM_LABELS: Record<SystemId, string> = {
  neon: "Neon",
  resend: "Resend",
  stripe: "Stripe",
  linus: "Linus",
  authjs: "Auth.js",
};

export const STATE_LABELS: Record<NodeState, string> = {
  built: "Runs today",
  planned: "Planned",
  blocked: "Blocked",
};

/** A step is planned if it is unbuilt, or if unbuilt work hangs off it. */
export function isPlanned(node: ProcessNode): boolean {
  return node.state === "planned" || node.plannedNote !== undefined;
}

export const KIND_LABELS: Record<NodeKind, string> = {
  start: "Start event",
  end: "End event",
  user: "Customer task",
  service: "System task",
  "gateway-xor": "Exclusive gateway",
  "gateway-and": "Parallel gateway",
};
