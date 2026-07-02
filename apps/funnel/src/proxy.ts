import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk runs on every route so `auth()` / `currentUser()` are available on the
 * `/clerk` demo route — but we intentionally protect NOTHING here. This funnel
 * runs two auth providers side by side for evaluation (Clerk at `/clerk`,
 * Auth.js at `/authjs`), and the signup → payment flow plus the `/assessments`
 * cookie gate must all work without a Clerk session. Each demo route guards
 * itself; global `auth.protect()` would force Clerk onto the entire app.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
