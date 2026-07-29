import Link from "next/link";
import { Card, Container, Heading, Section } from "@pbh/ui";

export const metadata = {
  title: "Check your email",
};

/**
 * Shown after a magic-link request (Auth.js `verifyRequest` page). Intentionally
 * generic: it says the same thing whether or not the address has an account, so
 * it never reveals who's registered.
 */
export default function CheckEmailPage() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <div className="flex flex-col gap-6">
            <div>
              <Heading as="h1" size="lg" className="mb-2">
                Check your email
              </Heading>
              <p className="text-on-surface-variant">
                If an account matches that address, we&rsquo;ve sent a secure
                sign-in link. Open it on this device to continue — it expires in
                30 minutes and can only be used once.
              </p>
            </div>

            <Card variant="bordered">
              <p className="text-sm text-on-surface-variant">
                Didn&rsquo;t get it? Check your spam folder, or{" "}
                <Link href="/login" className="text-primary underline">
                  request a new link
                </Link>
                .
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
