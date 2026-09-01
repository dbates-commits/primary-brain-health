import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEntitledTrack, resolveBookingUserId } from "@pbh/booking/server";
import { Container, Heading, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { WelcomeActions } from "@/components/welcome/WelcomeActions";

export const metadata = {
  title: "Choose how to start",
  robots: { index: false, follow: false },
};

// Both gates read cookies, so there is nothing to prerender.
export const dynamic = "force-dynamic";

/**
 * The screen after payment: the customer picks how to begin (Figma 1988:7030).
 * The booking modal sends them straight here once payment succeeds, and it is
 * also where a returning customer lands after a magic-link sign-in.
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
 * An unpaid visitor goes home rather than to `/login` — they are already signed
 * in, so `/login` would send them straight back here and loop. Home is where the
 * booking flow they abandoned actually lives, and the `?booking=resume` marker
 * is what makes it reopen at the step they reached: without it they land on the
 * signup form and hit the unique-email constraint. That is the whole return path
 * for someone whose booking cookie has aged out — they sign in, and this bounce
 * puts them back in the flow.
 */
export default async function WelcomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? resolveBookingUserId(await cookies());

  if (!userId) {
    redirect("/login");
  }
  if ((await getEntitledTrack(userId)) === null) {
    redirect("/?booking=resume#booking");
  }

  return (
    // 80px section padding and a 40px gap between the header block and the
    // cards, per the design's Section frame (1988:7032).
    <Section className="py-20">
      <Container>
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Heading as="h1" size="lg">
              Choose How to Start
            </Heading>
            {/* `text-aqua-default` in the token set is the teal accent, not a
                muted body colour — section descriptions across the site use
                `on-surface-variant`, which is what the design's #495e55 reads
                as here. */}
            <p className="max-w-[1000px] font-body text-body-lg text-text-default">
              You&rsquo;ve taken an important step for your brain health.
              Here&rsquo;s the path most people follow.
            </p>
          </div>
          <WelcomeActions />
        </div>
      </Container>
    </Section>
  );
}
