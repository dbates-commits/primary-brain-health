import type { ReactNode } from "react";
import { IncludesPanel } from "./IncludesPanel";

/**
 * The teal booking hero (Figma `360-2579`): headline + subtext and the white
 * booking card on the left, the "Includes" panel on the right. Presentational —
 * `children` is the card body (the signup form, or a resume prompt once the
 * account exists), so `StepFlow` owns the stateful bits.
 */
export function BookingHero({ children }: { children: ReactNode }) {
  return (
    <section className="bg-primary px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="font-headline text-4xl font-thin text-white md:text-5xl">
              Start With a Brain Health assessment &amp; Consultation
            </h1>
            <p className="text-xl leading-relaxed text-[#afd2e3]">
              A clinically grounded starting point to understand your cognitive
              health, review risk factors, and get a personalized plan for what to
              do next.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.24)]">
            {children}
          </div>
        </div>

        <IncludesPanel />
      </div>
    </section>
  );
}
