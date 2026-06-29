import { Container, Section } from "@pbh/ui";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
};

/**
 * Temporary email sign-in page (placeholder for Clerk). On success the form sets
 * the assessment session cookie and redirects to /assessments.
 */
export default function LoginPage() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <LoginForm />
        </Container>
      </Section>
    </main>
  );
}
