"use client";

import { useState } from "react";
import { SegmentedControl } from "@pbh/ui";

import { ComparisonTable } from "./ComparisonTable";
import { MODE_OPTIONS, type Mode } from "./mode";
import { OpenQuestions } from "./OpenQuestions";
import { RealWorldExamples } from "./RealWorldExamples";

/**
 * The whole comparison, and the only client component on the page.
 *
 * The toggle swaps one whole sentence for another rather than revealing extra
 * detail, so the rows keep their shape and the page does not jump under
 * somebody reading it. Plain English is the default: Ian and Melissa land there
 * first, and it is the view that gets screenshotted.
 *
 * The mode is state rather than a URL parameter — unlike the internal tabs next
 * door, which are links precisely because each one is worth sharing. Nobody
 * needs to send somebody else a link to the technical wording of this page;
 * they need to flip it while the page is open.
 */
export function StackComparison() {
  const [mode, setMode] = useState<Mode>("plain");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="stack-compare-mode"
          aria-label="How much detail to show"
          options={MODE_OPTIONS}
          value={mode}
          onChange={(event) => setMode(event.target.value as Mode)}
          className="max-w-xs"
        />
      </div>

      <ComparisonTable mode={mode} />

      <OpenQuestions />

      <RealWorldExamples />
    </div>
  );
}
