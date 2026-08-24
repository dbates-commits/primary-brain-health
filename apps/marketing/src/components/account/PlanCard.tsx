import { getCurrentPlan } from "@/lib/plan";
import { AccountCard } from "./AccountCard";
import { PlanSummary } from "./PlanSummary";

/**
 * Current Plan (Figma 1917:7817) — what this customer bought, and what it
 * includes.
 *
 * The async half: it reads, `PlanSummary` renders. `p-7 md:p-7`, not the bare
 * `p-7` the stub carried — `AccountCard`'s base is `p-6 md:p-8`, and
 * tailwind-merge resolves the unprefixed pair while leaving `md:p-8` standing,
 * so a lone `p-7` gives the design's 28px below `md` and 32px above it.
 *
 * No Storybook story: an async server component that reaches the database.
 * `Account/PlanSummary` is where the UI is exercised.
 */
export async function PlanCard({ userId }: { userId: string }) {
  const plan = await getCurrentPlan(userId);

  return (
    <AccountCard className="p-7 md:p-7">
      <PlanSummary plan={plan} />
    </AccountCard>
  );
}
