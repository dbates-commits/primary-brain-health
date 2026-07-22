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
 *
 * A `?email=…` query param (used by the marketing booking handoff, which sends
 * paid + enrolled users here) prefills the field, so they only need to confirm
 * to get their sign-in link.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/assessments");
  }

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
