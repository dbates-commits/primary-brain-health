"use client";

import { useActionState, useId, useState } from "react";
import {
  Button,
  FieldError,
  Heading,
  Label,
  cn,
  fieldBaseClass,
  fieldClass,
} from "@pbh/ui";
import type { LoginState } from "@/app/login/actions";

const initialState: LoginState = { status: "idle" };

/**
 * The body of the header login popover (Figma 1988:9756 / 1988:11481 /
 * 1988:10890): request a magic link without leaving the page.
 *
 * Carries its own card chrome — white, 12px radius, 32px padding — because the
 * same component is also the card inside `MobileLoginModal`, where there is no
 * popover around it. Width, and on mobile the tighter 20px padding, come from
 * the parent's `className`.
 *
 * The action is injected rather than imported so Storybook can render all four
 * states; `requestLoginLinkInline` is `"use server"` and pulls in Auth.js and
 * the database. Same arrangement as the booking steps.
 */
export function LoginPanel({
  action,
  onDone,
  className,
  ...rest
}: {
  action: (prev: LoginState, formData: FormData) => Promise<LoginState>;
  /** Dismiss the panel from the confirmation screen's "Done" button. */
  onDone?: () => void;
  className?: string;
  /** Set by `LoginMenu` so the popover is announced as a dialog. Omitted in
   * the mobile drawer, where the panel is just part of the menu. */
  id?: string;
  role?: "dialog";
  "aria-label"?: string;
  /** Set while the popover animates out, so a closing panel isn't tabbable. */
  inert?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [email, setEmail] = useState("");
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  const errorMessage = state.status === "error" ? state.message : undefined;

  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col gap-5 rounded-form-card bg-background-default p-8",
        "shadow-card",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {/* `size="sm"` is `text-body-lg md:text-h5`; both designs draw this at
            24px, so the mobile step is lifted to match rather than reading 20px
            below `md`. */}
        <Heading as="h2" size="sm" className="text-h5">
          {state.status === "sent" ? "Email Confirmation" : "Login"}
        </Heading>
        <p className="text-body text-ink-strong">
          {state.status === "sent"
            ? "We’ve sent you an email. Please check your inbox in order to login."
            : "Enter the email you used to create the account."}
        </p>
      </div>

      {state.status === "sent" ? (
        // Figma 1988:10534. "Done" only dismisses the panel — the sign-in link
        // is in the inbox by now, so there is nothing left to do here. It takes
        // focus because the field that had it has just been unmounted, which
        // would otherwise drop focus to the body with no announcement that
        // anything happened.
        <Button
          type="button"
          color="primary"
          className="w-full"
          onClick={onDone}
          autoFocus
        >
          Done
        </Button>
      ) : (
        <form action={formAction} noValidate>
          <fieldset
            disabled={pending}
            aria-busy={pending}
            className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0 transition-opacity disabled:opacity-60"
          >
            <div>
              {/* The visible label appears only alongside an error, which is
                  how the states are drawn (1988:10890 has it, the other two
                  don't). `aria-label` carries the accessible name the rest of
                  the time, so the field is never unlabelled. */}
              {errorMessage && <Label htmlFor={fieldId}>Email</Label>}
              <input
                id={fieldId}
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-label={errorMessage ? undefined : "Email"}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? errorId : undefined}
                placeholder="Your email here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errorMessage ? fieldClass : fieldBaseClass}
              />
              <FieldError id={errorId} message={errorMessage} />
            </div>

            {/* Disabled on emptiness only, never on validity: a button you
                can't press can't tell you why, so a malformed address has to
                reach the server and come back as an error message. */}
            {/* Figma draws the pristine CTA `brand/muted` — pale but fully
                opaque, not the 50% wash `Button` gives every disabled button.
                Same override, and same reasoning, as `ProfileForm`'s Save. */}
            <Button
              type="submit"
              color="primary"
              className={cn(
                "w-full",
                email.trim().length === 0 &&
                  "bg-brand-muted opacity-100 hover:brightness-100",
              )}
              disabled={email.trim().length === 0}
            >
              {pending ? "Sending…" : "Send Confirmation Email"}
            </Button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
