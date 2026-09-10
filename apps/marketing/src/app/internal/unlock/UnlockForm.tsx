"use client";

import { useActionState } from "react";

import { unlockAction, type UnlockState } from "./actions";

const INITIAL: UnlockState = {};

/** One field, one button. The username a browser would ask for buys nothing. */
export function UnlockForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(unlockAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label
        htmlFor="password"
        className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="h-11 rounded-xl border border-border-default bg-background-default px-3 text-body outline-none focus-visible:border-brand-default focus-visible:ring-2 focus-visible:ring-brand-pale"
      />
      {state.error ? (
        <p role="alert" className="text-body-sm text-error">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-brand-default px-4 text-body font-medium text-brand-on-brand disabled:opacity-60"
      >
        {pending ? "Checking…" : "Open"}
      </button>
    </form>
  );
}
