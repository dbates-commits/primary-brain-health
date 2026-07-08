/**
 * Single source of truth for the assessment price. Imported by BOTH the client
 * (PaymentStep display) and the server (PaymentIntent amount), so this module
 * must stay free of server-only imports.
 */
export const ASSESSMENT_PRICE_CENTS = 14900;
export const ASSESSMENT_CURRENCY = "usd";
