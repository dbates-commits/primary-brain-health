import { Button, Container, Heading } from "@pbh/ui";

export default function FunnelHome() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container size="narrow" className="py-24 text-center">
        <Heading as="h1" size="xl" className="text-primary">
          Primary Brain Health
        </Heading>
        <p className="mt-6 text-lg text-on-surface-variant">
          The funnel app. Sign in to view your assessments and download your
          reports. Booking and payment live on the marketing site.
        </p>
        <div className="mt-10">
          <Button href="/login" color="primary" size="lg">
            Sign in
          </Button>
        </div>
      </Container>
    </main>
  );
}
