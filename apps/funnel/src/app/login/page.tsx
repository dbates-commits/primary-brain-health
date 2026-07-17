import { redirect } from "next/navigation";
import { Container, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
};

/**
 * Passwordless sign-in page. Already-authenticated users skip straight to their
 * assessments; everyone else gets the magic-link request form.
 */
export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/assessments");
  }

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
