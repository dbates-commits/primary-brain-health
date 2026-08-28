import { Heading } from "@pbh/ui";
import { getProfileValues } from "@/lib/profile";
import { AccountCard } from "./AccountCard";
import { ProfileFormWithSession } from "./ProfileFormWithSession";
import { saveProfileAction } from "./actions";

/**
 * Profile Information (Figma 2092:13144) — the demographics a customer's
 * assessment is built from.
 *
 * This card owns the header and the rule under it; `ProfileForm` owns the
 * field grid, the second rule and the button, and `ProfileFormWithSession` sits
 * between them to refresh the session a save invalidates. Figma's newsletter checkbox and
 * its extra rule are deliberately absent, which is why the card's natural
 * height is 620px rather than the frame's 692.
 *
 * No Storybook story: this is an async server component that reaches the
 * database. `Account/ProfileForm` is where the UI is exercised.
 */
export async function ProfileInformationCard({ userId }: { userId: string }) {
  const initial = await getProfileValues(userId);

  return (
    <AccountCard>
      <Heading as="h2" size="md" className="leading-[1.06] md:text-[2rem]">
        Profile Information
      </Heading>
      <p className="mt-2 font-body text-body leading-[1.2] text-text-secondary">
        Update your personal details used for assessments and clinical
        consultations.
      </p>
      <hr className="mt-6 border-t border-border-subtle" />

      {initial ? (
        <ProfileFormWithSession action={saveProfileAction} initial={initial} />
      ) : (
        // Unreachable in practice — a session implies a row — but the read is
        // honestly nullable rather than asserted.
        <p className="mt-6 font-body text-body text-text-default">
          We couldn&rsquo;t load your profile. Please refresh and try again.
        </p>
      )}
    </AccountCard>
  );
}
