import { NextRequest, NextResponse } from "next/server";
import {
  submitHubSpotForm,
  HubSpotSubmitError,
  HUBSPOT_PORTAL_ID,
  HUBSPOT_CONTACT_FORM_GUID,
} from "@/lib/hubspot";

interface ContactBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_CONTACT_FORM_GUID) {
    console.warn(
      "[contact] HUBSPOT_PORTAL_ID or HUBSPOT_CONTACT_FORM_GUID not set — submission received but not forwarded.",
      body
    );
    return NextResponse.json({ success: true, sent: false });
  }

  const fields = [
    { name: "firstname", value: body.firstName ?? "" },
    { name: "lastname", value: body.lastName ?? "" },
    { name: "email", value: body.email ?? "" },
    { name: "phone", value: body.phone ?? "" },
    { name: "message", value: body.message ?? "" },
  ];

  const referer = request.headers.get("referer") ?? undefined;

  try {
    await submitHubSpotForm({
      portalId: HUBSPOT_PORTAL_ID,
      formGuid: HUBSPOT_CONTACT_FORM_GUID,
      fields,
      context: {
        pageUri: referer,
        pageName: "Contact",
      },
    });
    return NextResponse.json({ success: true, sent: true });
  } catch (err) {
    if (err instanceof HubSpotSubmitError) {
      console.error("[contact] HubSpot rejected submission", {
        status: err.status,
        body: err.body,
      });
      return NextResponse.json(
        { error: "Submission failed" },
        { status: 502 }
      );
    }
    console.error("[contact] Unexpected error submitting form", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 502 });
  }
}
