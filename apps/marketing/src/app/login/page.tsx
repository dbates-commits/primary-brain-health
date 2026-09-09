import { redirect } from "next/navigation";
import { Container, Heading, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { Auth0SignInButton } from "@/components/layout/Auth0SignInButton";
import { AUTH0_ENABLED } from "@/lib/auth0-enabled";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Sign-in page. Already-authenticated visitors skip straight to the welcome
 * screen; everyone else gets one button out to Auth0.
 *
 * Kept as a page even though it holds a single control, because `pages.signIn`
 * in `auth.ts` points Auth.js here — this is where an unauthenticated request
 * and a failed callback both land.
 *
 * There is no email field any more: the magic link was removed once Auth0
 * became the only provider, and the address is now typed on Auth0's own screen.
 * The `?email=…` prefill went with it — `login_hint` does that job from the
 * booking flow instead.
 */
export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/welcome");
  }

  return (
    <Section className="py-24">
      <Container size="narrow">
        <div className="flex flex-col gap-8">
          <div>
            <Heading as="h1" size="lg" className="mb-2">
              Sign in
            </Heading>
            <p className="text-text-default">
              {AUTH0_ENABLED
                ? "We\u2019ll send a code to the email on your account."
                : "Sign-in is unavailable right now. Please try again shortly."}
            </p>
          </div>
          {AUTH0_ENABLED && <Auth0SignInButton />}
        </div>
      </Container>
    </Section>
  );
}
