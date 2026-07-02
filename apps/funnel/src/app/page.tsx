import { StepFlow } from "./get-started/StepFlow";

/**
 * Funnel home. The booking flow (account creation → details → consent → Stripe
 * payment) is the landing experience and lives directly on `/`. Supporting
 * modules stay colocated under `get-started/`, which is no longer a route.
 */
export default function Home() {
  return (
    <main>
      <StepFlow />
    </main>
  );
}
