import { safeNext } from "@/lib/internal-unlock";

import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Internal — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * The password prompt for `/internal/*`. The proxy sends everyone here with the
 * page they were after in `next`.
 */
export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background-warm px-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          Primary Brain Health
        </p>
        <h1 className="mt-1 font-headline text-2xl text-text-heading">Internal pages</h1>
        <p className="mt-1 mb-5 text-body-sm text-text-secondary">
          Not indexed, and not linked from the site. Ask the team for the password.
        </p>
        <UnlockForm next={next} />
      </div>
    </div>
  );
}
