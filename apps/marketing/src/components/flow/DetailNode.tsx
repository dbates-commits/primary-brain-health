import type { Node, NodeProps } from "@xyflow/react";

import { DETAIL_COLUMN_WIDTH } from "./flow-layout";
import type { Step } from "./sequence-data";

export type DetailNodeType = Node<{ step: Step }, "detail">;

/** The right-hand column: what the step costs us. */
export function DetailNode({ data }: NodeProps<DetailNodeType>) {
  const { step } = data;
  return (
    <div className="pl-5" style={{ width: DETAIL_COLUMN_WIDTH }}>
      <dl className="grid grid-cols-[38px_1fr] gap-x-2 gap-y-1">
        {step.details.map((row, index) => (
          <div key={`${row.label}-${index}`} className="contents">
            <dt
              className={`text-[9.5px] leading-3.5 ${
                row.planned ? "text-aqua-default" : "text-text-default"
              }`}
            >
              {row.label}
            </dt>
            <dd
              className={`text-[9.5px] leading-3.5 ${
                row.planned ? "text-aqua-default" : "text-text-default"
              }`}
            >
              {row.planned ? "◇ " : ""}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
