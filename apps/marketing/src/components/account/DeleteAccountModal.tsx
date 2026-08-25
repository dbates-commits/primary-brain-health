"use client";

import {
  useActionState,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button, Checkbox, Heading, cn } from "@pbh/ui";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { usePopoverTransition } from "@/components/layout/use-popover-transition";
import {
  CONFIRM_FIELD,
  type DeleteAccountAction,
  type DeleteAccountState,
} from "@/lib/delete-account-state";

interface DeleteAccountModalProps {
  open: boolean;
  /** The address the request is being filed against. Shown, never submitted. */
  email: string;
  onClose: () => void;
  action: DeleteAccountAction;
  /** Fired once, on success, before the caller navigates away. */
  onDeactivated?: () => void;
  /** Keeps the pending state up while the caller finishes signing out. */
  busy?: boolean;
}

const IDLE: DeleteAccountState = { status: "idle" };

/**
 * The Delete Account confirmation (Figma 2060:7053).
 *
 * **Not built on `booking/Modal`.** That dialog gives a backdrop, Escape and a
 * scroll lock for free, and then imposes four things this design cannot take,
 * none of which are props: an unconditional X button — a third, ambiguous way to
 * dismiss, sitting next to an irreversible action — a baked-in `rounded-3xl
 * max-w-2xl` panel, a fixed-header/scrolling-body padding scheme against Figma's
 * one flat 32px box, and a scroll lock it applies by writing
 * `document.body.style.overflow` itself rather than through `useScrollLock`,
 * which that hook's own doc already names as debt. What this genuinely shares
 * with it is invisible, and those are the hooks imported above — the same
 * argument `MobileLoginModal` makes.
 *
 * No shared backdrop is extracted: `booking/Modal` would have to be refactored
 * to use one and `MobileLoginModal` is full-bleed with no backdrop at all, so it
 * would ship with a single consumer. A *third* backdropped dialog is the trigger
 * to extract it.
 *
 * Figma draws the checkbox already ticked. It ships unticked — a pre-satisfied
 * gate is not a gate.
 */
export function DeleteAccountModal({
  open,
  email,
  onClose,
  action,
  onDeactivated,
  busy,
}: DeleteAccountModalProps) {
  const { mounted, shown } = usePopoverTransition(open);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const bodyId = useId();
  const [state, formAction, pending] = useActionState(action, IDLE);
  const [confirmed, setConfirmed] = useState(false);
  const inFlight = pending || Boolean(busy);

  // Reset the gate on the *open* edge. This component is never unmounted while
  // the card lives — it early-returns instead — so `confirmed` would otherwise
  // survive a cancel and the next open would start pre-ticked. React's
  // adjust-state-during-render pattern, the same one `usePopoverTransition`
  // uses. A stale error is deliberately left alone: the failure did happen.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setConfirmed(false);
    }
  }

  useScrollLock(mounted);
  useFocusTrap({
    active: open,
    containerRef,
    onEscape: () => {
      if (!inFlight) {
        onClose();
      }
    },
  });

  // Latched on the state *object*, not on `status`: `useActionState` returns a
  // fresh object per submit, so this fires once per successful submission and
  // not again on the re-renders that follow it.
  const notifiedFor = useRef<DeleteAccountState | null>(null);
  useEffect(() => {
    if (state.status === "success" && notifiedFor.current !== state) {
      notifiedFor.current = state;
      onDeactivated?.();
    }
  }, [state, onDeactivated]);

  // React 19 auto-resets the <form> after a server action (requestFormReset),
  // which unticks the box in the DOM. `confirmed` is unchanged across that
  // re-render, so React doesn't re-assert it — and the result is a failed
  // request showing an unticked box above a still-enabled confirm button.
  // Re-apply after the commit, the same fix `ProfileForm` makes for its selects.
  useLayoutEffect(() => {
    const box = checkboxRef.current;
    if (box && box.checked !== confirmed) {
      box.checked = confirmed;
    }
  });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      onMouseDown={() => {
        if (!inFlight) {
          onClose();
        }
      }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-on-surface/50 p-4",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        // `aria-label`, not `aria-labelledby`: `@pbh/ui`'s `Heading` takes no
        // `id`, and widening a shared primitive for one call site is the
        // over-reach `AccountCard`'s frozen-API note argues against. The
        // paragraph takes an `id` natively, so the description works as-is.
        aria-label="Delete Account"
        aria-describedby={bodyId}
        tabIndex={-1}
        inert={!open}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          "w-full max-w-[620px] rounded-xl bg-surface p-8",
          "drop-shadow-[0px_4px_12px_rgba(0,0,0,0.24)]",
          "transition duration-200 ease-out motion-reduce:transition-none",
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        <Heading
          as="h2"
          size="lg"
          className="font-thin leading-[1.06] text-on-surface-variant"
        >
          Delete Account
        </Heading>

        <p
          id={bodyId}
          className="mt-8 font-body text-xl leading-[1.4] text-text-secondary"
        >
          You are sending a request to delete your account and data from our
          system. Are you sure you want to delete the account linked to{" "}
          {/* Figma `text/label` — the address is darker than the sentence
              around it, so the thing being acted on reads first. */}
          <span className="text-neutral-700">{email}</span>?
        </p>

        <form action={formAction} className="mt-10">
          <fieldset
            disabled={inFlight}
            aria-busy={inFlight}
            className="m-0 min-w-0 border-0 p-0"
          >
            <label className="flex items-center gap-2">
              <Checkbox
                ref={checkboxRef}
                name={CONFIRM_FIELD}
                checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                }}
              />
              <span className="font-body text-xl leading-[1.4] text-on-surface-variant">
                I understand that I won&rsquo;t be able to recover my account.
              </span>
            </label>

            {state.status === "error" ? (
              <p role="alert" className="mt-4 animate-error-in text-sm text-error">
                {state.message}
              </p>
            ) : null}

            <div className="mt-8 flex gap-4">
              {/* `color="white"` is already white-on-#44474d, Figma's Cancel.
                  The 1px hairline is a one-off — every `outline` variant in the
                  system is 2px — so it stays a call-site class. */}
              <Button
                type="button"
                color="white"
                onClick={onClose}
                className="flex-1 border border-border-strong"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="danger"
                disabled={!confirmed || inFlight}
                className="flex-1"
              >
                {inFlight ? "Deleting…" : "Request for Deletion"}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>,
    document.body,
  );
}
