"use client";

import { PhosphorIcon } from "@pbh/ui";
import type { AssessmentPackage } from "@pbh/booking";

/**
 * One assessment package card in the booking section (Figma 1088:4452): price,
 * name, the "includes" bullets, and the CTA that opens the booking modal.
 *
 * Cards stretch to equal height and the CTA is pinned to the bottom (`mt-auto`),
 * so the two sit level even though Comprehensive has an extra bullet.
 *
 * A package with `purchasable: false` renders the CTA disabled rather than
 * hiding the card — the design shows both packages, and we want the offer
 * visible while the fulfillment behind it is still being defined.
 */
export function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: AssessmentPackage;
  onSelect: (pkg: AssessmentPackage) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-xl bg-primary-container-high p-5">
      <div className="flex flex-1 flex-col gap-4">
        <p className="font-headline text-5xl font-thin leading-none text-white">
          {pkg.displayPrice}
        </p>
        <h3 className="font-headline text-2xl font-thin leading-none text-white">
          {pkg.name}
        </h3>
        <ul className="flex flex-col gap-4">
          {pkg.includes.map((item) => (
            <li key={item.text} className="flex items-center gap-4">
              <PhosphorIcon
                name="SealCheck"
                aria-hidden="true"
                size={24}
                weight="regular"
                className={
                  item.emphasis || !pkg.accentChecks
                    ? "shrink-0 text-white"
                    : "shrink-0 text-on-primary-highlight"
                }
              />
              <span
                className={
                  item.emphasis
                    ? "font-semibold text-on-primary-container"
                    : "text-on-primary-container"
                }
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {pkg.purchasable ? (
        <button
          type="button"
          onClick={() => onSelect(pkg)}
          className="mt-auto flex h-14 w-full items-center justify-center rounded-full bg-white px-6 font-bold text-on-surface-variant shadow-[0_8px_12px_rgba(0,0,0,0.12)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
        >
          {pkg.ctaLabel}
        </button>
      ) : (
        <div className="mt-auto">
          <button
            type="button"
            disabled
            aria-describedby={`${pkg.key}-availability`}
            className="flex h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-white/60 px-6 font-bold text-on-surface-variant"
          >
            {pkg.ctaLabel}
          </button>
          <p
            id={`${pkg.key}-availability`}
            className="mt-3 text-center text-sm text-on-primary-container"
          >
            Coming soon — contact us to register your interest.
          </p>
        </div>
      )}
    </div>
  );
}
