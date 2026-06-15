import { Container, Heading, Section } from "@pbh/ui";

export default function GetStarted() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="text-primary">
            Get started
          </Heading>
          <p className="mt-6 text-on-surface-variant">
            Placeholder for the signup → consent → payment flow. Built against
            the shared <code>@pbh/ui</code> design system in later tasks
            (pbh-bws.21 / pbh-bws.22).
          </p>
        </Container>
      </Section>
    </main>
  );
}
