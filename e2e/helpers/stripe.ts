import { expect, type FrameLocator } from "@playwright/test";

/**
 * Stripe's Embedded Checkout, once the payment step has mounted it.
 *
 * A frame locator resolves lazily, so this can be called before the iframe
 * exists — the wait happens on the first field in `payWith`.
 */
export function stripeFrame(page: {
  frameLocator: (selector: string) => FrameLocator;
}): FrameLocator {
  return page.frameLocator('iframe[name="embedded-checkout"]');
}

/**
 * Fill the Stripe card fields (stable ids in the embedded-checkout frame) and
 * submit. Opts out of Link "save my info", which otherwise forces a required
 * phone number and blocks the card charge.
 */
export async function payWith(
  stripe: FrameLocator,
  cardNumber: string,
): Promise<void> {
  await expect(stripe.locator("#cardNumber")).toBeVisible({ timeout: 30_000 });
  await stripe.locator("#cardNumber").fill(cardNumber);
  await stripe.locator("#cardExpiry").fill("1234");
  await stripe.locator("#cardCvc").fill("123");
  const cardName = stripe.locator("#billingName");
  if (await cardName.count()) {
    await cardName.fill("Ada Lovelace");
  }
  const postal = stripe.locator("#billingPostalCode");
  if (await postal.count()) {
    await postal.fill("02101");
  }
  const saveInfo = stripe.getByLabel(/save my info/i);
  if ((await saveInfo.count()) && (await saveInfo.isChecked())) {
    await saveInfo.uncheck();
  }
  await stripe.locator('button[type="submit"]').click();
}
