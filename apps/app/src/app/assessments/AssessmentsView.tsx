import { Card, Heading } from "@pbh/ui";
import { AssessmentCard } from "./AssessmentCard";
import type { EnrollmentView } from "@pbh/booking/server";

/**
 * The post-payment "Welcome Back" view from Figma: a welcome header, the first
 * assessment under "Start Here", any others under "Additional Assessments", and
 * a completion footer. Presentational — no hooks — so it renders from both the
 * server page and the client login form. Enrollments arrive already ordered and
 * carry their display copy (from `lib/linus/campaigns.ts`).
 */
export function AssessmentsView({
  firstName,
  enrollments,
}: {
  firstName?: string;
  enrollments: EnrollmentView[];
}) {
  const [first, ...rest] = enrollments;
  const total = enrollments.length;

  return (
    <div className="mx-auto flex w-full max-w-[840px] flex-col gap-10 px-4 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <Heading as="h1" size="lg" className="font-thin">
          Welcome Back{firstName ? `, ${firstName}` : ""}!
        </Heading>
        <p className="text-xl font-normal text-on-surface-variant">
          Complete your preferred assessments and then view your report
        </p>
      </header>

      {total === 0 ? (
        <Card variant="bordered">
          <p className="text-on-surface">
            Your assessments aren&rsquo;t ready just yet. Please check back
            shortly — if this persists, contact support and we&rsquo;ll help you
            get started.
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
        </>
      )}
    </div>
  );
}
