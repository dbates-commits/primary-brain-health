import type { ReactNode } from "react";
import { cn } from "@pbh/ui/utils";

interface AccountCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * The box every card on the account page sits in. Figma draws the Plan Card
 * (2092:13108) and the three "Profile Card Container"s (2092:13144 and its
 * siblings) as the same shell: white, 12px radius, a `border/subtle` hairline.
 * Padding is the only difference — 32px on the right-hand three, 28px on the
 * plan card — so that one passes `className="p-7"` and tailwind-merge drops the
 * default.
 *
 * **Deliberately only the box.** Headings, rules and bodies live in each card,
 * so the four can be built independently. Keep this API at
 * `{ children, className }`: the moment the shell grows props, both owners have
 * a reason to edit this file, which is exactly what it exists to prevent.
 */
export function AccountCard({ children, className }: AccountCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border-subtle bg-surface p-6 md:p-8",
        className
      )}
    >
      {children}
    </section>
  );
}
