import { Container, Section } from "@pbh/ui";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
};

/**
 * Temporary email sign-in page (placeholder for Clerk). On success the form sets
 * the assessment session cookie and redirects to /assessments. A `?email=…` query
 * param (used by the marketing booking handoff) prefills the field.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email } = await searchParams;
  const initialEmail = (Array.isArray(email) ? email[0] : email) ?? "";

  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <LoginForm initialEmail={initialEmail} />
        </Container>
      </Section>
    </main>
  );
}
