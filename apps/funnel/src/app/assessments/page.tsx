import { cookies } from "next/headers";
import { Card, Container, Eyebrow, Heading, Section } from "@pbh/ui";
import { EnrollmentResults } from "./EnrollmentResults";
import { LinusEnrollForm } from "./LinusEnrollForm";
import { ASSESSMENT_UID_COOKIE, listAssessments } from "./register-and-enroll";

export const metadata = {
  title: "Assessments",
};

/**
 * Post-payment landing. The payment step registers + enrolls the user and sets
 * the `ASSESSMENT_UID_COOKIE`; here we read that cookie and list their
 * assessment links (no PII in the URL). With no cookie the page falls back to
 * the manual lookup form (handy for testing).
 */
export default async function AssessmentsPage() {
  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  const result = uid ? await listAssessments(uid) : null;

  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Eyebrow>Brain Health</Eyebrow>
          <Heading as="h1" size="lg" className="mt-2 mb-2">
            {result ? "Your assessments" : "Enroll a subject"}
          </Heading>
          <p className="mb-8 text-on-surface-variant">
            {result
              ? "Use the links below to start each assessment."
              : "Enter a registered user’s email to generate their assessment enrollment links."}
          </p>

          {result === null && <LinusEnrollForm />}

          {result?.status === "success" && (
            <EnrollmentResults
              participantId={result.participantId}
              enrollments={result.enrollments}
            />
          )}

          {result?.status === "error" && (
            <Card variant="bordered">
              <p role="alert" className="text-error">
                {result.message}
              </p>
            </Card>
          )}
        </Container>
      </Section>
    </main>
  );
}
