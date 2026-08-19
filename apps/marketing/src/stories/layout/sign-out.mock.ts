/**
 * Storybook stand-in for `src/app/welcome/sign-out.ts`.
 *
 * The real action is `"use server"` and revokes the database session, so no
 * story can import it. `UserMenu` calls it through `useSignOut` — there is no
 * prop seam, because wiring sign-out *is* what the menu does — so
 * `.storybook/main.ts` aliases the module to this file.
 *
 * A story that actually clicks Logout would then hit `window.location.assign`
 * in the hook and navigate out of the frame; none does, and one that wants to
 * should stub that first.
 *
 * Keep the exported name in step with the real module.
 */

/** Records the submit so a story can assert it, and goes no further. */
export async function signOutAction(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 200);
  });
}
