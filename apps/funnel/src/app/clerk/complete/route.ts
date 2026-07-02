/**
 * Clerk → assessment session bridge. Clerk owns identity; this route reads the
 * signed-in Clerk user and runs the SHARED login logic (`completeProviderLogin`)
 * so the Clerk demo lands on the same assessment session as Auth.js, then
 * redirects to /assessments. A Route Handler (not a page) because it sets a
 * cookie. No Clerk session → back to /clerk.
 */

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { completeProviderLogin } from "@/lib/auth/complete-login";

export async function GET(request: Request): Promise<NextResponse> {
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await completeProviderLogin({
    email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return NextResponse.redirect(new URL("/assessments", request.url));
}
