import { ExampleList } from "./ExampleList";
import { HUBSPOT_EXAMPLES, OUR_EXAMPLES } from "./stack-compare-data";

/**
 * "When I told people what React Native was, I'd show them Facebook and
 * Instagram" — Alec's move, and the right one for this room.
 *
 * Deliberately short on both sides. Anything that could not be verified from a
 * live response header or a first-party page was left out rather than padded
 * in: one wrong name here costs the whole page its credibility, and the list
 * is only doing one job.
 */
export function RealWorldExamples() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-headline text-2xl text-text-heading">Who else runs these</h2>
        <p className="mt-1 max-w-3xl text-body-sm text-text-default">
          Neither list is an argument on its own. They are here because “who else uses it” is a fair
          question, and the answer is checkable rather than taken on trust.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ExampleList heading="Next.js, the way we build" examples={OUR_EXAMPLES} />
        <ExampleList heading="HubSpot CMS" examples={HUBSPOT_EXAMPLES} />
      </div>
    </section>
  );
}
