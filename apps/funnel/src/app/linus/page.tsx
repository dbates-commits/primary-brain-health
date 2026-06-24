import { Container, Eyebrow, Heading, Section } from "@pbh/ui";
import { LinusEnrollForm } from "./LinusEnrollForm";

export const metadata = {
  title: "Linus Enrollment",
};

export default function LinusPage() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Eyebrow>Linus Health</Eyebrow>
          <Heading as="h1" size="lg" className="mt-2 mb-2">
            Enroll a subject
          </Heading>
          <p className="mb-8 text-on-surface-variant">
            Enter a registered user&rsquo;s email to create their Linus subject
            and generate the assessment enrollment links.
          </p>
          <LinusEnrollForm />
        </Container>
      </Section>
    </main>
  );
}
