import type { Node, NodeProps } from "@xyflow/react";

import { STEP_COLUMN_WIDTH } from "./flow-layout";
import type { Step } from "./sequence-data";

export type StepNodeType = Node<{ step: Step }, "step">;

/** The left-hand column: the story of the step, in words. */
export function StepNode({ data }: NodeProps<StepNodeType>) {
  const { step } = data;
  return (
    <div className="pr-6" style={{ width: STEP_COLUMN_WIDTH }}>
      <p className="text-[10px] font-semibold tracking-widest text-brand-default">
        {step.number}
      </p>
      <h2 className="mt-1 text-[13px] leading-tight font-semibold text-text-heading">
        {step.title}
      </h2>
      <p className="mt-1 text-[11px] leading-4 text-text-default">
        {step.blurb}
      </p>
    </div>
  );
}
