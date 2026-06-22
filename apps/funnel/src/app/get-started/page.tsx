import { Container, Section } from "@pbh/ui";
import { StepFlow } from "./StepFlow";

export default function GetStarted() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <StepFlow />
        </Container>
      </Section>
    </main>
  );
}
