import { cookies } from "next/headers";
import { Card, Container, Heading, Section } from "@pbh/ui";
import { AssessmentsView } from "./AssessmentsView";
import { LinusEnrollForm } from "./LinusEnrollForm";
import {
  ASSESSMENT_UID_COOKIE,
  registerAndEnrollUserById,
} from "./register-and-enroll";

export const metadata = {
  title: "Assessments",
};

/**
 * Post-payment landing. The payment step sets the `ASSESSMENT_UID_COOKIE`; here
 * we read that cookie and re-enroll (idempotent POST) to fetch fresh assessment
 * links — Linus returns the existing valid link or generates a new one, so we
 * never serve a stale redirect. With no cookie — or if the lookup fails — the
 * page falls back to the manual lookup form (handy for testing).
 */
export default async function AssessmentsPage() {
  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  const result = uid ? await registerAndEnrollUserById(uid) : null;

  if (result?.status === "success") {
    return (
      <main>
        <Section className="py-16 sm:py-24">
          <AssessmentsView
            firstName={result.firstName}
            participantId={result.participantId}
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
          {result?.status === "error" ? (
            <>
              <Heading as="h1" size="lg" className="mb-2">
                Enroll a subject
              </Heading>
              <p className="mb-8 text-on-surface-variant">
                Enter a registered user’s email to generate their assessment
                enrollment links.
              </p>
              <Card variant="bordered">
                <p role="alert" className="text-error">
                  {result.message}
                </p>
              </Card>
            </>
          ) : (
            <LinusEnrollForm />
          )}
        </Container>
      </Section>
    </main>
  );
}
