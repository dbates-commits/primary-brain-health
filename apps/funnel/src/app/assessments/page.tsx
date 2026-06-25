import { cookies } from "next/headers";
import { Card, Container, Heading, Section } from "@pbh/ui";
import { AssessmentsView } from "./AssessmentsView";
import { LinusEnrollForm } from "./LinusEnrollForm";
import { ASSESSMENT_UID_COOKIE, listAssessments } from "./register-and-enroll";

export const metadata = {
  title: "Assessments",
};

/**
 * Post-payment landing. The payment step registers + enrolls the user and sets
 * the `ASSESSMENT_UID_COOKIE`; here we read that cookie and render their
 * assessments (no PII in the URL). With no cookie — or if the lookup fails —
 * the page falls back to the manual lookup form (handy for testing).
 */
export default async function AssessmentsPage() {
  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  const result = uid ? await listAssessments(uid) : null;

  if (result?.status === "success") {
    return (
      <main>
        <Section className="py-16 sm:py-24">
          <AssessmentsView
            firstName={result.firstName}
            enrollments={result.enrollments}
          />
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="mb-2">
            Enroll a subject
          </Heading>
          <p className="mb-8 text-on-surface-variant">
            Enter a registered user’s email to generate their assessment
            enrollment links.
          </p>

          {result?.status === "error" ? (
            <Card variant="bordered">
              <p role="alert" className="text-error">
                {result.message}
              </p>
            </Card>
          ) : (
            <LinusEnrollForm />
          )}
        </Container>
      </Section>
    </main>
  );
}
