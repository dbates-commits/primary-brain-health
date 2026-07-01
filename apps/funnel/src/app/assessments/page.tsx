import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, Container, Heading, Section } from "@pbh/ui";
import { AssessmentsView } from "./AssessmentsView";
import {
  ASSESSMENT_UID_COOKIE,
  registerAndEnrollUserById,
} from "./register-and-enroll";

export const metadata = {
  title: "Assessments",
};

/**
 * Post-payment landing. The payment step (or the /login form) sets the
 * `ASSESSMENT_UID_COOKIE`; here we read it and re-enroll (idempotent for active
 * enrollments) to resolve each assessment's links/report state. With no cookie
 * we bounce to /login (Clerk will own that flow later); registration itself is
 * gated to the payment step, so this read path never creates a subject.
 */
export default async function AssessmentsPage() {
  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  if (!uid) {
    redirect("/login");
  }

  const result = await registerAndEnrollUserById(uid, { allowRegister: false });

  if (result.status === "success") {
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
            Assessments
          </Heading>
          <p className="mb-8 text-on-surface-variant">
            We couldn&rsquo;t load your assessments.
          </p>
          <Card variant="bordered">
            <p role="alert" className="text-error">
              {result.status === "error"
                ? result.message
                : "Something went wrong. Please try again."}
            </p>
          </Card>
        </Container>
      </Section>
    </main>
  );
}
