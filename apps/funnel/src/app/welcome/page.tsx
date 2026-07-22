import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@pbh/db";
import { Container, Heading } from "@pbh/ui";
import { auth } from "@/auth";
import { WelcomeActions } from "./WelcomeActions";

export const metadata = {
  title: "Choose How to Start",
};

/**
 * First-login "Choose How to Start" screen. Auth is the Auth.js session (minted
 * by a magic-link sign-in): no session bounces to /login. It shows only once —
 * after a user leaves via either CTA we stamp `welcomeSeenAt`, so a returning
 * user (flag set) skips straight to /assessments. Registration is gated to the
 * payment step, so this read path never creates a subject.
 */
export default async function WelcomePage() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    redirect("/login");
  }

  const [user] = await db
    .select({ welcomeSeenAt: users.welcomeSeenAt })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  if (!user) {
    redirect("/login");
  }
  if (user.welcomeSeenAt) {
    redirect("/assessments");
  }

  return (
    <main className="flex min-h-screen items-center justify-center py-16 sm:py-24">
      <Container size="default">
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <Heading as="h1" size="lg">
              Choose How to Start
            </Heading>
            <p className="max-w-3xl text-lg text-on-surface-variant">
              You&rsquo;ve already made an important decision for your brain
              health; now you can choose how you&rsquo;d like to begin your care
              journey. Both options lead to a navigator and a clear plan &mdash;
              this just helps you pick the path that fits you best.
            </p>
          </div>
          <WelcomeActions />
        </div>
      </Container>
    </main>
  );
}
