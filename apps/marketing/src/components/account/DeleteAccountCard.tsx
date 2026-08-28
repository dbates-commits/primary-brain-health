import { getProfileValues } from "@/lib/profile";
import { AccountCard } from "./AccountCard";
import { DeleteAccountPanelWithSignOut } from "./DeleteAccountPanelWithSignOut";
import { deleteAccountAction } from "./actions";

/**
 * Delete Account (Figma 1988:12282), the last card on the account page.
 *
 * I/O only. Everything visible lives in `DeleteAccountPanel` — unlike
 * `ProfileInformationCard`, which keeps its header here, because this card's
 * copy is the part most worth pinning in a story.
 *
 * The email is read rather than taken from the session: the session callback
 * returns `{ id, firstName }` and nothing more, on purpose. `getProfileValues`
 * already selects it in an explicit column list, so this needs no query of its
 * own.
 *
 * Figma's 32px padding is `AccountCard`'s default `md:p-8`, so no override.
 *
 * No Storybook story: this is an async server component that reaches the
 * database. `Account/DeleteAccountPanel` is where the UI is exercised.
 */
export async function DeleteAccountCard({ userId }: { userId: string }) {
  const initial = await getProfileValues(userId);

  return (
    <AccountCard>
      {initial ? (
        <DeleteAccountPanelWithSignOut
          email={initial.email}
          action={deleteAccountAction}
        />
      ) : (
        // Unreachable in practice — a session implies a row — but the read is
        // honestly nullable rather than asserted.
        <p className="font-body text-base text-on-surface-variant">
          We couldn&rsquo;t load your account. Please refresh and try again.
        </p>
      )}
    </AccountCard>
  );
}
