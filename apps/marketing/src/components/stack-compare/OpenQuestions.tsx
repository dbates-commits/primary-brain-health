import { OPEN_QUESTIONS } from "./stack-compare-data";

/**
 * What the page needs from a person, in one place near the top.
 *
 * The same items are on the rows they belong to, as "to confirm" lines. They
 * are repeated here because a reader who came for the comparison will not open
 * nine rows looking for them, and because two of them — the Lighthouse number
 * and the analytics decision — should be settled before this is shown to Ian
 * rather than after.
 */
export function OpenQuestions() {
  return (
    <section className="rounded-2xl border border-border-default bg-background-default p-5">
      <h2 className="text-body font-semibold text-text-heading">
        Before this goes further — {OPEN_QUESTIONS.length} things that need a person
      </h2>
      <ol className="mt-3 flex flex-col gap-3">
        {OPEN_QUESTIONS.map((question, index) => (
          <li key={question.ask} className="grid grid-cols-[1.25rem_1fr] gap-x-2">
            <span className="text-body-sm text-text-tertiary tabular-nums">{index + 1}.</span>
            <div>
              <p className="text-body-sm font-semibold text-text-heading">{question.ask}</p>
              <p className="mt-0.5 text-body-sm text-text-default">{question.why}</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">Who: {question.who}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
