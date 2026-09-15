import { notFound } from "next/navigation";

import { InternalTabs } from "@/components/internal/InternalTabs";
import { internalPagesHidden } from "@/lib/internal-gate";
import { ServiceList } from "@/components/services";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * What the site depends on, who owns it, and what each thing actually does —
 * written for someone who does not work in the code.
 */
export default function ServicesPage() {
  if (internalPagesHidden()) {
    notFound();
  }

  return (
    // Full-bleed like the journey tab next door: these pages are their own
    // thing, and the customer-facing header and footer are not part of it.
    <div className="fixed inset-0 z-50 overflow-auto bg-background-warm px-6 py-6">
      <header>
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          Primary Brain Health · internal
        </p>
        <h1 className="mt-1 font-headline text-3xl text-text-heading">Services</h1>
        <p className="mt-1 mb-4 max-w-3xl text-body-sm text-text-default">
          Every outside company the site depends on: what it is, what it does for us, who owns it,
          and what exists in each environment. Anything marked “to confirm” is a question for a
          person — the code does not know who holds the account.
        </p>
        <InternalTabs active="/internal/services" />
      </header>
      <div className="mt-5">
        <ServiceList />
      </div>
    </div>
  );
}
