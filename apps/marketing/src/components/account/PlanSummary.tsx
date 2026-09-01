import { Button, Heading, PhosphorIcon, cn } from "@pbh/ui";
import type { CurrentPlan } from "@/lib/plan";

/**
 * Everything inside the Current Plan card (Figma 1917:7817), and its empty
 * state.
 *
 * Props-only and free of the database, which is what makes it storyable —
 * `PlanCard` is the async half that does the reading. Same split, and same
 * reason, as `ProfileForm` under `ProfileInformationCard`.
 *
 * **The copy is not Figma's.** The design names the plan "Brain Health
 * Assessment & Consultation" and lists "Clinician review of results" and
 * "Consultation to collect relevant health history", all three of which match
 * `CLINICAL_ONLY_PATTERNS` — this is a wellness-coded purchase, and those are
 * claims about what was sold. Everything here comes from `ASSESSMENT_PACKAGES`
 * instead, which the compliance sweep in `packages.test.ts` already guards.
 */
export function PlanSummary({ plan }: { plan: CurrentPlan | null }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-body-sm font-bold text-text-default">
          CURRENT PLAN
        </p>
        {plan ? (
          <span className="rounded-xl bg-accent-green-container px-2.5 py-1 font-body text-caption font-semibold text-accent-green">
            Active
          </span>
        ) : null}
      </div>

      {plan ? (
        <>
          <div className="flex flex-col gap-4">
            <p className="font-headline text-[2.5rem] font-thin leading-none text-text-default">
              {plan.price}
            </p>
            <Heading as="h2" size="sm" className="text-h5 font-thin">
              {plan.name}
            </Heading>
          </div>

          <hr className="border-t border-border-subtle" />

          <div className="flex flex-col gap-3">
            <p className="font-body text-caption font-semibold text-ink-strong">
              What&rsquo;s Included:
            </p>
            <ul className="flex flex-col gap-3">
              {plan.includes.map((item) => (
                <li key={item.text} className="flex items-center gap-2">
                  <PhosphorIcon
                    name="SealCheck"
                    aria-hidden="true"
                    size={18}
                    weight="regular"
                    className="shrink-0 text-text-default"
                  />
                  {/* `emphasis` renders bold — the Comprehensive package leads
                      with a bold callback to Basic. Basic uses it nowhere, but
                      dropping it here would silently flatten that card if this
                      ever renders a $449 plan. */}
                  <span
                    className={cn(
                      "font-body text-caption text-text-default",
                      item.emphasis && "font-bold",
                    )}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        // No succeeded payment. The card keeps its slot rather than collapsing
        // the column: somebody who signed up and never paid still reaches this
        // page, and an absent card would read as a loading failure.
        <div className="flex flex-col items-start gap-4">
          <p className="font-body text-body text-text-default">
            You don&rsquo;t have an active plan yet.
          </p>
          <Button href="/#intake" color="primary">
            Book an assessment
          </Button>
        </div>
      )}
    </div>
  );
}
