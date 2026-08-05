import { redirect } from "next/navigation";
import { Card, Container, Heading, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { AssessmentsView } from "./AssessmentsView";
import { SignOutButton } from "./SignOutButton";
import { getEntitledTrack, registerAndEnrollUserById } from "@pbh/booking/server";

export const metadata = {
  title: "Assessments",
};

/**
 * Post-payment landing, gated by the Auth.js session — minted by a magic-link
 * sign-in. Here we read it, re-enroll (idempotent for active enrollments) to
 * resolve each assessment's links/report state, and never register a new subject
 * (registration is gated to the payment step). With no session we bounce to
 * /login — the proxy already redirects anonymous visitors, this is the
 * authoritative server-side check.
 */
export default async function AssessmentsPage() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    redirect("/login");
  }

  const result = await registerAndEnrollUserById(uid, { allowRegister: false });

  // Page chrome speaks to the reader's *current* entitlement; each card carries
  // the track its own assessment was produced under. Only a paid user reaches
  // this page, so a null entitlement means something is wrong upstream — fall
  // back to wellness, which can only ever understate what they bought.
  const track = (await getEntitledTrack(uid)) ?? "wellness";

  if (result.status === "success") {
    return (
      <main>
        <Section className="py-16 sm:py-24">
          <div className="mb-6 flex justify-end">
            <SignOutButton />
          </div>
          <AssessmentsView
            firstName={result.firstName}
            track={track}
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
          <div className="mb-6 flex justify-end">
            <SignOutButton />
          </div>
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
