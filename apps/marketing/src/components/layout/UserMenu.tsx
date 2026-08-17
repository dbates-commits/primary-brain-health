"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { PhosphorIcon } from "@pbh/ui";
import { signOutAction } from "@/app/welcome/sign-out";
import { USER_MENU_LINKS, userMenuItemClass } from "./user-menu-items";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const initial = firstName.trim().charAt(0).toUpperCase();

  function close({ restoreFocus = false }: { restoreFocus?: boolean } = {}) {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    wrapperRef.current
      ?.querySelector<HTMLElement>('[role="menu"] a, [role="menu"] button')
      ?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close({ restoreFocus: true });
      }
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
          className="flex size-8 items-center justify-center rounded-full bg-primary font-body text-base font-medium text-on-primary"
        >
          {initial}
        </span>
        <span className="font-body text-base font-medium tracking-tight text-on-surface">
          {firstName}
        </span>
        <PhosphorIcon
          name="CaretDown"
          size={16}
          aria-hidden="true"
          className="text-on-surface"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute top-full right-0 z-50 mt-1.5 flex flex-col rounded-xl border border-neutral-350 bg-white p-1 drop-shadow-[0px_8px_12px_rgba(0,0,0,0.08)]"
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

          {/* Logout goes through the same server action as the welcome screen,
              which revokes the database session rather than just dropping the
              cookie — a signed-out session has to be dead everywhere. */}
          <form action={signOutAction}>
            <button type="submit" role="menuitem" className={userMenuItemClass}>
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
