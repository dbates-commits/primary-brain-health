import type { ChangeEventHandler } from "react";
import { cn } from "./utils";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  /** Shared radio group name — the submitted field name. */
  name: string;
  options: SegmentedControlOption[];
  /** Uncontrolled: the initially selected value. */
  defaultValue?: string;
  /** Controlled: the selected value (pair with `onChange`). */
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "aria-label": string;
  className?: string;
}

/**
 * Pill segmented toggle (e.g. "Myself / Someone Else"). A CSS-only radio group —
 * the selected segment is driven by `peer-checked`, so it needs no client JS of
 * its own and works uncontrolled (`defaultValue`) or controlled (`value` +
 * `onChange`). Columns size to the number of options.
 */
export function SegmentedControl({
  name,
  options,
  defaultValue,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-1 rounded-full bg-surface-container-low p-1",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selection =
          value === undefined
            ? { defaultChecked: defaultValue === option.value }
            : { checked: value === option.value };
        return (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              onChange={onChange}
              className="peer sr-only"
              {...selection}
            />
            {/* py-2.5 (not py-3): with the group's own p-1, a 20px line box and
                10px of vertical padding land the control on the designs' 48px
                field height, matching the inputs it sits beside. */}
            <span className="flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-secondary-container peer-checked:bg-surface-container-lowest peer-checked:text-on-secondary-container peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary-fixed-dim">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
