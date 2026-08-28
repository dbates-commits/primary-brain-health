import Image from "next/image";
import { Button, Card, Heading, PhosphorIcon } from "@pbh/ui";

/**
 * The two paths out of the welcome screen (Figma 1988:7036), restored from the
 * version that went with `apps/app` in f5cf5a3 and re-cut to the current design.
 *
 * Both cards stretch to the taller one and the body copy flexes, so the two
 * CTAs sit on one baseline however the paragraphs wrap.
 *
 * Copy note: the earlier version called this "Talk to a Specialist", which
 * `CLINICAL_ONLY_PATTERNS` bans outright — the surface is wellness-coded and
 * "specialist" is a claim about what was sold. "Brain Health Coach" is the
 * design's wording and the compliant one; the avatar file was renamed to match.
 *
 * Both destinations are `#` placeholders: scheduling and the assessments
 * hand-off are not wired up yet.
 */
export function WelcomeActions() {
  return (
    <div className="grid w-full gap-5 sm:grid-cols-2">
      <Card
        variant="bordered"
        className="flex flex-col items-center gap-4 rounded-2xl border-border-subtle text-center"
      >
        <Image
          src="/welcome/coach.png"
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
        <div className="flex flex-1 flex-col gap-2">
          <Heading as="h2" size="sm">
            Talk to a Brain Health Coach
          </Heading>
          <p className="font-body text-base text-text-secondary">
            If you&rsquo;re feeling overwhelmed, you can schedule your Coach call
            right away. Completing your assessments first just means your Coach
            can provide the fullest picture.
          </p>
        </div>
        <Button href="#" color="primary">
          Request Appointment
        </Button>
      </Card>

      <Card
        variant="bordered"
        className="flex flex-col items-center gap-4 rounded-2xl border-border-subtle text-center"
      >
        <PhosphorIcon
          name="ClipboardText"
          size={48}
          className="text-ink-strong"
        />
        <div className="flex flex-1 flex-col gap-2">
          <Heading as="h2" size="sm">
            Start with Assessments
          </Heading>
          <p className="font-body text-base text-text-secondary">
            Complete your brain health assessments first &mdash; so when you meet
            your Coach, they can walk through your results with you, not
            generalities.
          </p>
        </div>
        <Button href="#" color="primary">
          Start Assessments
        </Button>
      </Card>
    </div>
  );
}
