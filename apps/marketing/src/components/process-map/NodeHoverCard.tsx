import { SYSTEM_LABELS, type ProcessNode } from "./process-model";

/**
 * The hover state: name, what it touches, and whether it runs today.
 *
 * CSS-only, shown by the `group-hover` on the shape that owns it — a hovered
 * node on a pannable canvas is a pointer event we would otherwise have to hold
 * in React state and clean up on every viewport change.
 */
export function NodeHoverCard({ node }: { node: ProcessNode }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border-default bg-background-default p-3 text-left opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      <p className="text-[11px] font-semibold text-text-heading">{node.name}</p>
      <p className="mt-1 line-clamp-3 text-[10px] leading-4 text-text-secondary">
        {node.description}
      </p>
      {node.systems.length > 0 ? (
        <p className="mt-2 text-[10px] text-text-secondary">
          Calls {node.systems.map((id) => SYSTEM_LABELS[id]).join(" · ")}
        </p>
      ) : null}
      {node.plannedNote ? (
        <p className="mt-1 text-[10px] text-aqua-default">◇ planned work here</p>
      ) : null}
    </div>
  );
}
