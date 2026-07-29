"use client";

import Image from "next/image";
import { Button, Card, PhosphorIcon } from "@pbh/ui";
import { markWelcomeSeen } from "./actions";

/**
 * The two path-choosing cards on the welcome screen (Figma node 1088:1650).
 * Client component because "Talk to a Specialist" is a placeholder until the
 * Navigator flow (pbh-30f) lands; "Start with Assessments" submits a form to the
 * `markWelcomeSeen` server action, which stamps the flag and redirects to
 * /assessments. Both cards are equal height: the body copy flexes so the CTAs
 * align along the same baseline.
 */
export function WelcomeActions() {
  function handleNavigator() {
    alert(
      "The Start With Navigator flow will be implemented separately (pbh-30f).",
    );
  }

  return (
    <div className="grid w-full gap-5 sm:grid-cols-2">
      <Card
        variant="bordered"
        padding="lg"
        className="flex flex-col items-center gap-4 text-center"
      >
        <Image
          src="/welcome/specialist.png"
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="font-headline text-2xl text-on-surface">
            Talk to a Specialist
          </h2>
          <p className="text-on-surface-variant">
            For individuals and care partners who feel overwhelmed, have many
            initial questions, or want guidance before diving into testing.
          </p>
        </div>
        <Button type="button" onClick={handleNavigator}>
          Start With Navigator
        </Button>
      </Card>

      <Card
        variant="bordered"
        padding="lg"
        className="flex flex-col items-center gap-4 text-center"
      >
        <PhosphorIcon
          name="ClipboardText"
          size={48}
          className="text-on-surface"
        />
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="font-headline text-2xl text-on-surface">
            Start with Assessments
          </h2>
          <p className="text-on-surface-variant">
            Best for individuals and care partners who are ready to move forward
            now and who want results to guide the conversation.
          </p>
        </div>
        <form action={markWelcomeSeen}>
          <Button type="submit">Start Assessments</Button>
        </form>
      </Card>
    </div>
  );
}
