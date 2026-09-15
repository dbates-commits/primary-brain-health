import Link from "next/link";
import { cn } from "@pbh/ui/utils";

const TABS = [
  { href: "/internal/flow", label: "Customer journey" },
  { href: "/internal/services", label: "Services" },
  { href: "/internal/emails", label: "Emails" },
];

/**
 * The nav across the internal pages.
 *
 * Links rather than client-side tab state: each view is its own URL, which is
 * what makes one of them shareable — which is the whole point of these pages.
 */
export function InternalTabs({ active }: { active: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-1.5 text-body-sm transition-colors",
            tab.href === active
              ? "bg-brand-default text-brand-on-brand"
              : "text-text-secondary hover:bg-background-warm-strong",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
