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
 *
 * `?error=` is Auth.js's, and it has to be read here because this is also
 * `pages.error`: a refused sign-in lands back on this page. Rendering it
 * matters more than it used to — the visitor now holds an Auth0 session we
 * refused, so pressing the button again would silently re-authenticate the same
 * identity and be refused again. `AccessDenied` therefore offers a button that
 * forces Auth0's login screen, which is the only way to arrive as somebody
 * else.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/welcome");
  }

  const raw = (await searchParams).error;
  const error = Array.isArray(raw) ? raw[0] : raw;
  const refused = error === "AccessDenied";

  return (
    <Section className="py-24">
      <Container size="narrow">
        <div className="flex flex-col gap-8">
          <div>
            <Heading as="h1" size="lg" className="mb-2">
              Sign in
            </Heading>
            <p className="text-text-default">
              {!AUTH0_ENABLED
                ? "Sign-in is unavailable right now. Please try again shortly."
                : refused
                  ? "That email doesn\u2019t have an active Primary Brain Health account. Sign in with the address you booked with, or book a consultation to create one."
                  : error
                    ? "Sign-in didn\u2019t complete. Please try again."
                    : "We\u2019ll send a code to the email on your account."}
            </p>
          </div>
          {AUTH0_ENABLED && (
            // After a refusal, force Auth0's own login screen: its SSO cookie
            // still names the identity we just turned away, so anything else
            // repeats the same refusal without ever asking for an address.
            <Auth0SignInButton
              forceLogin={refused}
              label={refused ? "Try a different email" : undefined}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
