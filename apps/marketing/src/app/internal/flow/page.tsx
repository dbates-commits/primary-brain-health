import { notFound } from "next/navigation";

import { MapLegend, MapStats, ProcessMap } from "@/components/process-map";

// Evaluate the gate per request (and skip build-time prerendering entirely).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer journey — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * Stakeholder view of the customer journey as a process map.
 *
 * Internal, like the email previews next door: `/internal/` is disallowed in
 * `robots.ts`, this page sets its own noindex, and production hides it unless
 * PROCESS_MAP_ENABLED=1 is set. It describes the flow; it is not part of it.
 */
export default function CustomerJourneyPage() {
  const hidden = process.env.VERCEL_ENV === "production" && process.env.PROCESS_MAP_ENABLED !== "1";
  if (hidden) {
    notFound();
  }

  return (
    // Fixed and full-bleed: this screen is a canvas, and the site header and
    // footer around it are chrome for customers, not for a diagram. Covering
    // them from the page keeps the root layout — and every other route — alone.
    <div className="fixed inset-0 z-50 flex flex-col gap-3 overflow-hidden bg-background-warm px-6 py-5">
      <header className="shrink-0">
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          Primary Brain Health · staging, as it runs today
        </p>
        <h1 className="mt-1 font-headline text-3xl text-text-heading">Customer journey</h1>
        <p className="mt-1 max-w-4xl text-body-sm text-text-default">
          Landing page → booking → payment → what happens after. Click any step for what it does,
          which vendors it calls, what it writes down, who owns it and how it fails. Filter to one
          vendor, or to what actually runs today.
        </p>
      </header>
      <MapStats />
      <ProcessMap />
      <MapLegend />
    </div>
  );
}
