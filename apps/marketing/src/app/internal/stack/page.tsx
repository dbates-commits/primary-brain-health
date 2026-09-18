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
          What we have today, against building the same website in HubSpot Content Hub. Every claim
          about HubSpot links to where it came from; every claim about us names a file in the
          repository. Anything neither could settle is written as a question for a person.
        </p>
        <p className="mt-2 max-w-3xl text-body-sm text-text-default">
          <span className="font-semibold text-text-heading">
            This is not a question of whether to use HubSpot.
          </span>{" "}
          The CRM stays either way — the enquiry forms already post into it, and work is in review
          to record a customer there when they pay. The question on this page is narrower: should
          the <em>website</em> be built in HubSpot instead of the way it is built now. Two rows
          below say HubSpot would be better, and both are gaps we could close ourselves.
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
