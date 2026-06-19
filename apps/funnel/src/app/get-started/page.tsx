import { Container, Heading, Section } from "@pbh/ui";
import { StepFlow } from "./StepFlow";

export default function GetStarted() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="text-primary">
            Get started
          </Heading>
          <p className="mt-6 text-on-surface-variant">
            Create your account, add your details, and review our terms to
            begin. Payment lands in a later task (pbh-bws.22).
          </p>
          <StepFlow />
        </Container>
      </Section>
    </main>
  );
}
