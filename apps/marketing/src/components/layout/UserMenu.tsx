"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { PhosphorIcon, cn } from "@pbh/ui";
import { useSignOut } from "@/lib/use-sign-out";
import { USER_MENU_LINKS, userMenuItemClass } from "./user-menu-items";
import { usePopoverTransition } from "./use-popover-transition";

/**
 * The signed-in account menu in the header (Figma 1917:7795 for the trigger,
 * 1917:7808 for the dropdown): initial avatar, first name, caret, and a
 * Dashboard / Profile / Logout list.
 *
 * Same popover behaviour as `LoginMenu` — Escape and click-outside close it,
 * focus goes to the first item on open and back to the trigger on close — but
 * it is a menu rather than a dialog, so it is built and labelled as one.
 */
export function UserMenu({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState(false);
  const { mounted, shown } = usePopoverTransition(open);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { signOut, pending: signingOut } = useSignOut();

  const initial = firstName.trim().charAt(0).toUpperCase();

  function close({ restoreFocus = false }: { restoreFocus?: boolean } = {}) {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  /** The menu's items, in DOM order — what the arrow keys move between. */
  function menuItems(): HTMLElement[] {
    return Array.from(
      wrapperRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
        [],
    );
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    menuItems()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close({ restoreFocus: true });
        return;
      }

      // `aria-haspopup="menu"` promises arrow-key navigation, so provide it:
      // a menu that can only be walked with Tab is lying about what it is.
      const items = menuItems();
      if (items.length === 0) {
        return;
      }
      const current = items.indexOf(document.activeElement as HTMLElement);
      let next: number | null = null;
      if (e.key === "ArrowDown") {
        next = current < 0 ? 0 : (current + 1) % items.length;
      } else if (e.key === "ArrowUp") {
        next =
          current < 0
            ? items.length - 1
            : (current - 1 + items.length) % items.length;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = items.length - 1;
      }
      if (next === null) {
        return;
      }
      e.preventDefault();
      items[next]?.focus();
    }

    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (e.relatedTarget && !wrapperRef.current?.contains(e.relatedTarget)) {
      close();
    }
  }

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className="flex cursor-pointer items-center gap-2"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-brand-default font-body text-base font-medium text-brand-on-brand"
        >
          {initial}
        </span>
        <span className="font-body text-base font-medium tracking-tight text-ink-strong">
          {firstName}
        </span>
        <PhosphorIcon
          name="CaretDown"
          size={16}
          aria-hidden="true"
          className="text-ink-strong"
        />
      </button>

      {mounted && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          // Out of the tab order while it animates away — it outlives `open`
          // by the length of the transition.
          inert={!open}
          className={cn(
            "absolute top-full right-0 z-50 mt-1.5 flex flex-col rounded-xl border border-grey-350 bg-white p-1 drop-shadow-[0px_8px_12px_rgba(0,0,0,0.08)]",
            // Same 200ms ease-out as the booking modal, scaled from the
            // top-right so it opens out of the trigger it hangs from.
            "origin-top-right transition duration-200 ease-out motion-reduce:transition-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {USER_MENU_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              role="menuitem"
              onClick={() => close()}
              className={userMenuItemClass}
            >
              {item.label}
            </Link>
          ))}

          {/* Logout goes through the same hook as the welcome screen, which
              revokes the database session rather than just dropping the cookie
              — a signed-out session has to be dead everywhere — and then leaves
              with a document load so the header stops showing this menu.

              A button rather than a form: `role="menuitem"` has to be owned by
              the `role="menu"`, and a wrapping element breaks that ownership,
              so assistive tech would not count Logout among the menu's items. */}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className={userMenuItemClass}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
