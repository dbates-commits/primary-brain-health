import { SignIn } from "@clerk/nextjs";
import { Container, Heading, Section } from "@pbh/ui";

export const metadata = {
  title: "Sign in",
};

/**
 * Sign in with Clerk (magic link). This is the canonical login route — the
 * `/assessments` gate bounces here when there's no session. On success Clerk
 * forwards to `/clerk/complete`, which maps the Clerk identity onto the shared
 * assessment session cookie and lands the user on /assessments.
 */
export default function LoginPage() {
  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="mb-8 text-center">
            Sign in
          </Heading>
          <div className="flex justify-center">
            <SignIn
              routing="hash"
              forceRedirectUrl="/clerk/complete"
              signUpUrl="/"
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
