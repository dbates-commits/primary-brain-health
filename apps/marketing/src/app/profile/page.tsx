import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsBanner } from "@/components/account/AccountSettingsBanner";
import { DeleteAccountCard } from "@/components/account/DeleteAccountCard";
import { PaymentDetailsCard } from "@/components/account/PaymentDetailsCard";
import { PlanCard } from "@/components/account/PlanCard";
import { ProfileInformationCard } from "@/components/account/ProfileInformationCard";

export const metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

// `auth()` reads cookies, so there is nothing here to prerender.
export const dynamic = "force-dynamic";

/**
 * Account Settings (Figma 2092:13081) — where a customer manages their profile,
 * their payment details and their account.
 *
 * A session is the only gate. `/welcome` additionally requires an entitlement
 * because it is the post-payment screen, but somebody who signed up and never
 * paid still needs to reach their own profile and card on file. What that means
 * for the plan card — a redirect or an empty state — is that card's decision to
 * make, since it needs the plan data either way.
 */
export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    // The design puts the brand ground *behind* the fixed header — its Nav
    // frame has no fill of its own — but `<body>` is white and the root layout's
    // `<main>` is `pt-20`. Cancelling and re-applying that offset inside the
    // coloured box is what keeps a white band from appearing above the banner.
    <div className="-mt-20 min-h-screen bg-background-brand-subtle pt-20">
      {/* The header's own inner frame: `max-w-[90rem]` with 24/40px gutters, so
          the banner's left edge lines up with the logo above it. `Container`
          would be 1152px wide with 32px gutters. */}
      <div className="mx-auto max-w-[90rem] px-6 py-8 lg:px-10 lg:py-10">
        <AccountSettingsBanner />

        {/* 484 : 836 with a 40px gutter is the Figma split (2092:13106).
            Expressed as `fr` it holds that ratio at every width instead of only
            at 1440, and `items-start` leaves the plan card at its own height
            rather than stretching it down the right column. */}
        <div className="mt-8 grid grid-cols-1 items-start gap-5 lg:mt-10 lg:grid-cols-[minmax(0,484fr)_minmax(0,836fr)] lg:gap-10">
          {/* The plan follows the customer down the much taller right column,
              which is the point of a two-column split this lopsided. Sticky
              only from `lg`: stacked, it is just the first card and pinning it
              would cover the ones below. `top-24` clears the fixed header
              (80px) with the same 16px of air the page has above it, and it
              works because the grid is `items-start` — a stretched item is as
              tall as its track and has nowhere to travel. */}
          <div className="lg:sticky lg:top-24">
            <PlanCard />
          </div>
          <div className="flex flex-col gap-5">
            <ProfileInformationCard userId={session.user.id} />
            <PaymentDetailsCard />
            <DeleteAccountCard />
          </div>
        </div>
      </div>
    </div>
  );
}
