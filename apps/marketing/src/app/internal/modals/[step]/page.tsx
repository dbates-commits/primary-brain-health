import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@tina/__generated__/client";
import { isModalStep } from "@/components/booking/steps";
import { BookingStepPreview } from "../BookingStepPreview";
import { STEP_LIST, STEP_META } from "../step-registry";
import { ModalStepClient } from "./ModalStepClient";

// Read at request time rather than at build, so an editor's save shows on
// reload. Cached for a few seconds rather than fetched per request, because the
// route is deliberately un-gated (see below): without this, anyone can spend a
// TinaCloud content-API call per curl until the quota that also serves the real
// pages is gone. Costs an editor nothing — the admin renders this in an iframe
// where `useTina` is already streaming their unsaved edits live.
export const revalidate = 10;

export const metadata = {
  title: "Booking modal step — Primary Brain Health",
  robots: { index: false, follow: false },
};

// No `generateStaticParams`: the four steps are cheap to render on first hit
// and revalidate from there, and prerendering them would put a build-time
// dependency on the CMS for a route no customer visits.

/**
 * One booking-modal step, exactly as a customer sees it, with its own Tina form
 * beside it in the admin.
 *
 * This is where the Modals collection's `ui.router` sends an editor. It exists
 * because the modal is otherwise unreadable: `details`, `consent` and `payment`
 * sit behind a signed booking cookie, a confirmed email address and a live
 * Stripe session, so nobody editing that copy can reach three of the four
 * screens they are editing.
 *
 * Not gated in production, unlike `/internal/emails`: this is the editing
 * surface for a live collection, and editors work in the production admin. It
 * is noindexed here and disallowed in `robots.ts`, holds no customer data, and
 * every action on it is inert.
 */
export default async function ModalStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  // Called before the query, never inside its `try`: `notFound()` works by
  // throwing, and a bare `catch` would swallow it into a broken success page.
  if (!isModalStep(step)) {
    notFound();
  }

  let result: Awaited<ReturnType<typeof client.queries.modal>> | null = null;
  try {
    result = await client.queries.modal({ relativePath: `${step}.json` });
  } catch (error) {
    // Deliberately not a 404. The step renders fine on the copy that ships in
    // code, and that is the honest state on a preview deployment, where
    // TinaCloud serves `main`'s schema and this collection doesn't exist yet.
    console.error(`[modals] could not read ${step}.json:`, error);
  }

  return (
    <div className="min-h-screen bg-surface-container-low px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-on-surface-variant">
          <Link href="/internal/modals" className="text-primary underline">
            Booking modal steps
          </Link>
        </p>
        <h1 className="mt-2 font-headline text-3xl text-on-surface">
          {STEP_META[step].name}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
          {STEP_META[step].when}
        </p>
        {!result ? (
          <p className="mt-4 max-w-2xl rounded-lg bg-surface p-4 text-sm text-on-surface-variant">
            Showing the wording that ships in code — the CMS copy for this step
            couldn’t be loaded. On a preview deployment that is expected until
            the Modals collection reaches the main branch.
          </p>
        ) : null}
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {STEP_LIST.map((item) => (
            <Link
              key={item.step}
              href={`/internal/modals/${item.step}`}
              className={
                item.step === step
                  ? "font-semibold text-on-surface"
                  : "text-primary underline"
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          {result ? (
            <ModalStepClient
              step={step}
              data={result.data}
              query={result.query}
              variables={result.variables}
            />
          ) : (
            <BookingStepPreview step={step} />
          )}
        </div>
      </div>
    </div>
  );
}
