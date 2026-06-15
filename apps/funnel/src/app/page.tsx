import { Button, Container, Heading } from "@pbh/ui";

export default function FunnelHome() {
  return (
    <main className="flex min-h-screen items-center">
      <Container size="narrow" className="py-24 text-center">
        <Heading as="h1" size="xl" className="text-primary">
          Primary Brain Health
        </Heading>
        <p className="mt-6 text-lg text-on-surface-variant">
          The funnel app. Account creation, consent capture, Stripe payment, and
          the signed-token handoff live here.
        </p>
        <div className="mt-10">
          <Button href="/get-started" color="primary" size="lg">
            Get started
          </Button>
        </div>
      </Container>
    </main>
  );
}
