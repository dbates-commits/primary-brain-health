import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEntitledTrack, resolveBookingUserId } from "@pbh/booking/server";
import { Button, Container, Section } from "@pbh/ui";
import { auth } from "@/auth";
import { EngagementAppCta } from "@/components/welcome/EngagementAppCta";

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
 * Two ways in, checked in order:
 *  1. An Auth.js session — the magic-link path.
 *  2. The booking cookie plus a succeeded payment. This covers the customer
 *     whose post-payment session mint failed, or who closed the modal and came
 *     back, for the cookie's 2h life. It grants nothing beyond rendering an
 *     external link, so it is a cheap safety net rather than a second door.
 */
export default async function WelcomePage() {
  const session = await auth();
  let allowed = Boolean(session?.user?.id);

  if (!allowed) {
    const userId = resolveBookingUserId(await cookies());
    allowed = userId !== null && (await getEntitledTrack(userId)) !== null;
  }

  if (!allowed) {
    redirect("/login");
  }

  return (
    <Section className="py-24">
      <Container size="narrow">
        <div className="flex flex-col gap-6">
          <EngagementAppCta />
          <Button href="/" variant="ghost" className="w-full">
            Back to Primary Brain Health
          </Button>
        </div>
      </Container>
    </Section>
  );
}
