import { redirect } from "next/navigation";
import { Container, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Passwordless sign-in page. Already-authenticated users skip straight to the
 * welcome screen; everyone else gets the magic-link request form.
 *
 * A `?email=…` query param prefills the field, so anyone arriving from an email
 * link only needs to confirm to get their sign-in link.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/welcome");
  }

  const { email } = await searchParams;
  const initialEmail = (Array.isArray(email) ? email[0] : email) ?? "";

  return (
    <Section className="py-24">
      <Container size="narrow">
        <LoginForm initialEmail={initialEmail} />
      </Container>
    </Section>
  );
}
