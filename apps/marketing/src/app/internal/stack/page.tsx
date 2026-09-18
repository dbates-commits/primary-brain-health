import { notFound } from "next/navigation";

import { InternalTabs } from "@/components/internal/InternalTabs";
import { internalPagesHidden } from "@/lib/internal-gate";
import { StackComparison } from "@/components/stack-compare";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our stack vs HubSpot — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * What we built, against building the same site in HubSpot Content Hub.
 *
 * Alec's ask after the debrief with Mark and Stef, for Ian and Melissa. Two of
 * the rows go to HubSpot and the page says so early — a comparison in which the
 * incumbent wins everything is one nobody believes, and both of those rows are
 * things worth fixing rather than arguing with.
 *
 * Internal, like the tabs next door: `/internal/` is disallowed in `robots.ts`,
 * the proxy asks for a password, this page sets its own noindex, and production
 * hides it unless INTERNAL_PAGES_ENABLED=1.
 */
export default function StackComparisonPage() {
  if (internalPagesHidden()) {
    notFound();
  }

  return (
    // Full-bleed like the other internal tabs: switching between them should
    // not make the site header appear and disappear.
    <div className="fixed inset-0 z-50 overflow-auto bg-background-warm px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          Primary Brain Health · internal
        </p>
        <h1 className="mt-1 font-headline text-3xl text-text-heading">Our stack vs HubSpot</h1>
        <p className="mt-1 max-w-3xl text-body-sm text-text-default">
          <span className="font-semibold text-text-heading">Not whether to use HubSpot</span> — the
          CRM stays either way. Whether the <em>website</em> should be built in Content Hub instead.
          Two rows go to HubSpot.
        </p>
        <div className="mt-3">
          <InternalTabs active="/internal/stack" />
        </div>
        <div className="mt-6">
          <StackComparison />
        </div>
      </div>
    </div>
  );
}
