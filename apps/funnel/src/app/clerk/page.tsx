import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Container, Heading, Section } from "@pbh/ui";

export const metadata = {
  title: "Clerk demo",
};

/**
 * Clerk demo route — one of the two provider spikes. If a Clerk session already
 * exists we go straight to the bridge (`/clerk/complete`), which maps the Clerk
 * identity onto the shared assessment session. Otherwise we render Clerk's
 * hosted `<SignIn>`; on success Clerk forwards to the same bridge. Compare with
 * /authjs. Uses hash routing so the whole flow stays on this one route.
 */
export default async function ClerkPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/clerk/complete");
  }

  return (
    <main>
      <Section className="py-24">
        <Container size="narrow">
          <Heading as="h1" size="lg" className="mb-8 text-center">
            Sign in with Clerk
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
