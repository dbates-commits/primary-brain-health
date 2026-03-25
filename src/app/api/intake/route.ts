import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Integrate with HubSpot API to create/update contacts
  // - Create or update contact with form fields
  // - Trigger enrollment in brain health consultation workflow
  console.log("Intake form submission:", body);

  return NextResponse.json({ success: true });
}
