import { Container, Heading, Section } from "@pbh/ui";
import { SignupForm } from "./SignupForm";

export default function GetStarted() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="text-primary">
            Get started
          </Heading>
          <p className="mt-6 text-on-surface-variant">
            Create your account to begin. The full consent → payment flow lands
            in later tasks (pbh-bws.21 / pbh-bws.22).
          </p>
          <SignupForm />
        </Container>
      </Section>
    </main>
  );
}
