"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@pbh/ui/utils";

import { neighboursOf } from "./map-layout";
import { STATE_DOT } from "./node-styles";
import { KIND_LABELS, STATE_LABELS, SYSTEM_LABELS, type ProcessNode } from "./process-model";

type DetailPanelProps = {
  node: ProcessNode | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

/**
 * The slide-over: everything about one step, and a way to walk to its
 * neighbours without going back to the canvas.
 */
export function DetailPanel({ node, onClose, onSelect }: DetailPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!node) {
      return;
    }
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [node, onClose]);

  const neighbours = node ? neighboursOf(node.id) : [];

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          node ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={node ? node.name : "Step detail"}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(26rem,100%)] flex-col border-l border-border-default bg-background-default transition-transform duration-200",
          node ? "translate-x-0" : "translate-x-full",
        )}
      >
        {node ? (
          <>
            <header className="flex items-start gap-3 border-b border-border-default px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-text-heading">{node.name}</h2>
                <p className="mt-0.5 flex items-center gap-2 text-body-sm text-text-secondary">
                  <span className={cn("size-1.5 rounded-full", STATE_DOT[node.state])} />
                  {KIND_LABELS[node.kind]} · {STATE_LABELS[node.state]}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-text-secondary hover:bg-background-warm"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex flex-col gap-5 overflow-auto px-5 py-4 pb-10">
              <p className="text-body-sm text-text-default">{node.description}</p>

              {node.plannedNote ? (
                <div className="rounded-xl border border-aqua-default bg-aqua-subtle p-3">
                  <p className="text-body-sm text-text-default">
                    <span className="font-medium text-aqua-default">◇ Planned — </span>
                    {node.plannedNote}
                  </p>
                </div>
              ) : null}

              {node.systems.length > 0 ? (
                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                    Calls
                  </h3>
                  <p className="mt-1 text-body-sm text-text-default">
                    {node.systems.map((id) => SYSTEM_LABELS[id]).join(" · ")}
                  </p>
                </section>
              ) : null}

              {node.writes.length > 0 ? (
                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                    Writes
                  </h3>
                  <ul className="mt-1 flex flex-col gap-1">
                    {node.writes.map((line) => (
                      <li key={line} className="text-body-sm text-text-default">
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {node.sends.length > 0 ? (
                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                    Sends
                  </h3>
                  <p className="mt-1 text-body-sm text-text-default">{node.sends.join(" · ")}</p>
                </section>
              ) : null}

              <section>
                <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                  Owned by
                </h3>
                <dl className="mt-1 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 text-body-sm">
                  <dt className="text-text-secondary">Package</dt>
                  <dd className="text-text-default">{node.owner.package}</dd>
                  <dt className="text-text-secondary">Start here</dt>
                  <dd className="break-all text-text-default">
                    <code className="rounded bg-background-warm px-1 py-0.5 text-[11px]">
                      {node.owner.file}
                    </code>
                  </dd>
                  <dt className="text-text-secondary">Team</dt>
                  <dd className="text-text-default">{node.owner.team}</dd>
                </dl>
              </section>

              {node.failure ? (
                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                    How it fails
                  </h3>
                  <p className="mt-1 text-body-sm text-text-default">{node.failure}</p>
                </section>
              ) : null}

              {neighbours.length > 0 ? (
                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
                    Connected to
                  </h3>
                  <div className="mt-1 flex flex-col gap-1.5">
                    {neighbours.map((link) => (
                      <button
                        key={`${link.direction}-${link.other.id}`}
                        type="button"
                        onClick={() => onSelect(link.other.id)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border-default px-3 py-2 text-left text-body-sm text-text-default hover:bg-background-warm"
                      >
                        <span>{link.other.name}</span>
                        <span className="text-[11px] text-text-secondary">
                          {link.direction}
                          {link.label ? ` · ${link.label}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
