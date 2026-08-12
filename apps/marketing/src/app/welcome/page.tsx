import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEntitledTrack, resolveBookingUserId } from "@pbh/booking/server";
import { Button, Container, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { EngagementAppCta } from "@/components/welcome/EngagementAppCta";
import { SignOutButton } from "./SignOutButton";

export const metadata = {
  title: "You're all set",
  robots: { index: false, follow: false },
};

// Both gates read cookies, so there is nothing to prerender.
export const dynamic = "force-dynamic";

/**
 * The terminal screen: payment is done and the only thing left is the link out
 * to the Linus Engagement App. The booking modal sends the customer straight
 * here once payment succeeds, and it is also where a returning customer lands
 * after a magic-link sign-in.
 *
 * Identity comes from either an Auth.js session (the magic-link path) or the
 * booking cookie — the latter covers a customer whose post-payment session mint
 * failed, or who came back within the cookie's 2h life.
 *
 * **Whichever proves identity, the payment is what grants access.** Accounts
 * exist from signup, before anyone pays, so a session alone means nothing here:
 * an abandoned signup can request a magic link like anybody else, and without
 * this check they would land on "Your payment is confirmed" and a CTA into the
 * Engagement App having never paid.
 *
 * An unpaid visitor goes to `/` rather than `/login` — they are already signed
 * in, so `/login` would send them straight back here and loop. Home is where
 * the booking flow they abandoned actually lives.
 */
export default async function WelcomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const userId = session?.user?.id ?? resolveBookingUserId(await cookies());

  if (!userId) {
    redirect("/login");
  }
  if ((await getEntitledTrack(userId)) === null) {
    redirect("/");
  }

  return (
    <Section className="py-24">
      <Container size="narrow">
        <div className="flex flex-col gap-6">
          <EngagementAppCta />
          <Button href="/" variant="ghost" className="w-full">
            Back to Primary Brain Health
          </Button>
          {signedIn ? <SignOutButton /> : null}
        </div>
      </Container>
    </Section>
  );
}
