import Link from "next/link";
import { Card, Container, Heading, Section } from "@pbh/ui";

export const metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

/**
 * Shown after a magic-link request (Auth.js `verifyRequest` page).
 *
 * Only a registered address reaches this screen — an unregistered one is turned
 * back at the form with "Not an active user" (see `../actions.ts` and the
 * disclosure note in `docs/auth.md`), so the copy no longer hedges about
 * whether an account matched.
 */
export default function CheckEmailPage() {
  return (
    <Section className="py-24">
      <Container size="narrow">
        <div className="flex flex-col gap-6">
          <div>
            <Heading as="h1" size="lg" className="mb-2">
              Check your email
            </Heading>
            <p className="text-text-default">
              We&rsquo;ve sent a secure sign-in link. Open it on this device to
              continue — it expires in 15 minutes and can only be used once.
            </p>
          </div>

          <Card variant="bordered">
            <p className="text-body-sm text-text-default">
              Didn&rsquo;t get it? Check your spam folder, or{" "}
              <Link href="/login" className="text-brand-default underline">
                request a new link
              </Link>
              .
            </p>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
