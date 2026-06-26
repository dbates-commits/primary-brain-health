import { Card, Heading } from "@pbh/ui";
import { AssessmentCard } from "./AssessmentCard";
import {
  ASSESSMENT_CONTENT,
  ASSESSMENT_ORDER_FALLBACK,
} from "./assessment-content";
import type { EnrollmentView } from "./register-and-enroll";

/**
 * The post-payment "Welcome Back" view from Figma: a welcome header, the first
 * assessment under "Start Here", any others under "Additional Assessments", and
 * a completion footer. Presentational — no hooks — so it renders from both the
 * server page and the client lookup form.
 */
export function AssessmentsView({
  firstName,
  participantId,
  enrollments,
}: {
  firstName?: string;
  participantId?: string;
  enrollments: EnrollmentView[];
}) {
  // Apply the Figma copy by campaign key and sort into the design's order
  // (DAC first → "Start Here"). Falls back to the env-configured fields for
  // any campaign without a constants entry.
  const ordered = enrollments
    .map((enrollment) => {
      const content = ASSESSMENT_CONTENT[enrollment.key];
      return {
        enrollment: {
          ...enrollment,
          name: content?.label ?? enrollment.name,
          description: content?.description ?? enrollment.description,
          duration: content?.duration ?? enrollment.duration,
        },
        order: content?.order ?? ASSESSMENT_ORDER_FALLBACK,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((item) => item.enrollment);

  const [first, ...rest] = ordered;
  const total = ordered.length;
  // We don't track assessment completion yet, so this is always 0 for now.
  // TODO(linus): derive from real completion status once we have it.
  const completed = 0;

  return (
    <div className="mx-auto flex w-full max-w-[840px] flex-col gap-10 px-4 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <Heading as="h1" size="lg" className="font-thin">
          Welcome Back{firstName ? `, ${firstName}` : ""}!
        </Heading>
        <p className="text-xl font-normal text-on-surface-variant">
          Complete your preferred assessments and then view your report
        </p>
        {participantId && (
          <p className="text-xs text-on-surface-variant">
            Participant ID:{" "}
            <span className="font-mono break-all">{participantId}</span>
          </p>
        )}
      </header>

      {total === 0 ? (
        <Card variant="bordered">
          <p className="text-on-surface">
            You&rsquo;re registered, but no assessments are configured yet. Set
            the <code>LINUS_CAMPAIGNS</code> environment variable to add them.
          </p>
        </Card>
      ) : (
        <>
          {first && (
            <section className="flex flex-col gap-2.5">
              <p className="font-body text-base font-medium text-primary">
                Start Here
              </p>
              <AssessmentCard enrollment={first} highlighted />
            </section>
          )}

          {rest.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <p className="font-body text-base font-medium text-primary">
                Additional Assessments
              </p>
              <div className="flex flex-col gap-4">
                {rest.map((enrollment) => (
                  <AssessmentCard
                    key={enrollment.campaignId}
                    enrollment={enrollment}
                  />
                ))}
              </div>
            </section>
          )}

          <footer className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row sm:px-6">
            <p className="font-headline text-2xl font-thin text-on-surface sm:text-[2rem]">
              {completed} / {total} assessments complete
            </p>
            {/* Enabled once all assessments are complete — not tracked yet. */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex h-[51px] cursor-not-allowed items-center justify-center rounded-full bg-surface-container px-6 font-body text-base font-bold text-outline"
            >
              View My Report
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
