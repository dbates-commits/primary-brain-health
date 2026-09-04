"use client";

import { PhosphorIcon } from "@pbh/ui";

/** A checked line under a step's body (Figma 2268:3291). The seal is Phosphor's
 *  `SealCheck` at `regular` — the same glyph the design places, so it takes the
 *  brand colour from a token rather than shipping a second copy of the icon. */
export function StackBullet({
  text,
  tinaField,
}: {
  text?: string;
  tinaField?: string;
}) {
  if (!text) {
    return null;
  }

  return (
    <li className="flex items-center gap-3" data-tina-field={tinaField}>
      <PhosphorIcon
        name="SealCheck"
        weight="regular"
        aria-hidden="true"
        className="size-5 shrink-0 text-text-brand"
      />
      <span className="font-body text-body-sm text-text-secondary">{text}</span>
    </li>
  );
}
