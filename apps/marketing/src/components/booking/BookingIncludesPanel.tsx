import { PhosphorIcon } from "@pbh/ui";
import { DEFAULT_PACKAGE } from "@pbh/booking";

/**
 * The right-hand panel of the booking section (Figma 1804:17908): what the
 * assessment includes, then the price and the HSA/FSA note under a divider.
 *
 * Both come from `DEFAULT_PACKAGE` rather than being written here, so the
 * promise a customer reads and the Stripe price they are charged can't drift
 * apart — the same reason the catalog exists. There is no CTA: the form on the
 * left is the only way in, so a second button would just compete with it.
 */
export function BookingIncludesPanel() {
  return (
    <div className="flex h-full flex-col gap-10 rounded-xl bg-brand-850 p-5">
      <div className="flex flex-col gap-4">
        <h3 className="font-headline text-subtitle font-thin leading-none text-text-inverse">
          Includes
        </h3>
        <ul className="flex flex-col gap-4">
          {DEFAULT_PACKAGE.includes.map((item) => (
            <li key={item.text} className="flex items-start gap-4">
              <PhosphorIcon
                name="SealCheck"
                aria-hidden="true"
                size={24}
                weight="regular"
                className="shrink-0 text-brand-wash"
              />
              <span className="text-brand-wash">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pushed to the bottom so the price sits against the panel's base
          however many bullets the package has. */}
      <div className="mt-auto flex flex-col gap-4">
        <hr className="border-t border-border-inverse/20" />
        <p className="font-headline text-h2 font-thin leading-none text-text-inverse">
          {DEFAULT_PACKAGE.displayPrice}
        </p>
        <p className="text-caption leading-normal text-brand-wash">
          This service may be eligible for{" "}
          <span className="text-text-inverse">HSA/FSA reimbursement</span>, depending on
          your plan. We can provide documentation to support submission.
        </p>
        <p className="text-caption font-bold leading-normal text-brand-wash">
          Full refund within 14 days if you haven&apos;t started.
        </p>
      </div>
    </div>
  );
}
