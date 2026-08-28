import Link from "next/link";
import { STEP_LIST } from "./step-registry";

export const metadata = {
  title: "Booking modal steps — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * Index of the booking modal's steps, in flow order.
 *
 * The Tina admin's own Modals collection list is the primary way in; this is
 * for anyone who lands on a step URL from a shared link and wants the others,
 * and it deliberately runs no Tina query — a page with no document registers no
 * form, so there is never any doubt about which of the four the sidebar is
 * editing.
 */
export default function ModalsIndexPage() {
  return (
    <div className="min-h-screen bg-background-warm px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-headline text-3xl text-ink-strong">
          Booking modal steps
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-default">
          The four steps inside the booking modal, in the order a customer meets
          them. Open one to see it exactly as it renders, and — from the Tina
          admin — to edit its heading beside it. Everything else on these
          screens is code-owned, and the forms are inert.
        </p>
        <ul className="mt-8 flex flex-col gap-4">
          {STEP_LIST.map((item) => (
            <li key={item.step}>
              <Link
                href={`/internal/modals/${item.step}`}
                className="block rounded-2xl bg-background-default p-6 shadow-sm transition-colors hover:bg-background-warm"
              >
                <span className="font-headline text-xl text-ink-strong">
                  {item.name}
                </span>
                <span className="mt-1 block max-w-2xl text-sm text-text-default">
                  {item.when}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
