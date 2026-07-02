import { Container, Section } from "@pbh/ui";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Auth.js demo",
};

/**
 * Auth.js (next-auth v5) demo route — one of the two provider spikes. Renders
 * the credentials sign-in; success converges on the shared assessment session
 * and forwards to /assessments. Compare with /clerk.
 */
export default function AuthjsPage() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <SignInForm />
        </Container>
      </Section>
    </main>
  );
}
