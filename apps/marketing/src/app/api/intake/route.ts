import { NextRequest, NextResponse } from "next/server";
import {
  submitHubSpotForm,
  HubSpotSubmitError,
  HUBSPOT_PORTAL_ID,
  HUBSPOT_INTAKE_FORM_GUID,
} from "@/lib/hubspot";

interface IntakeBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  yearOfBirth?: string;
  gender?: string;
  educationLevel?: string;
  patientIdentification?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  let body: IntakeBody;
  try {
    body = (await request.json()) as IntakeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_INTAKE_FORM_GUID) {
    console.warn(
      "[intake] HUBSPOT_PORTAL_ID or HUBSPOT_INTAKE_FORM_GUID not set — submission received but not forwarded.",
      body
    );
    return NextResponse.json({ success: true, sent: false });
  }

  const fields = [
    { name: "firstname", value: body.firstName ?? "" },
    { name: "lastname", value: body.lastName ?? "" },
    { name: "email", value: body.email ?? "" },
    { name: "phone", value: body.phone ?? "" },
    { name: "year_of_birth", value: body.yearOfBirth ?? "" },
    { name: "gender", value: body.gender ?? "" },
    { name: "education_level", value: body.educationLevel ?? "" },
    {
      name: "patient_identification",
      value: body.patientIdentification ?? "",
    },
    { name: "message", value: body.message ?? "" },
  ];

  const referer = request.headers.get("referer") ?? undefined;

  try {
    await submitHubSpotForm({
      portalId: HUBSPOT_PORTAL_ID,
      formGuid: HUBSPOT_INTAKE_FORM_GUID,
      fields,
      context: {
        pageUri: referer,
        pageName: "Consultation Intake",
      },
    });
    return NextResponse.json({ success: true, sent: true });
  } catch (err) {
    if (err instanceof HubSpotSubmitError) {
      console.error("[intake] HubSpot rejected submission", {
        status: err.status,
        body: err.body,
      });
      return NextResponse.json(
        { error: "Submission failed" },
        { status: 502 }
      );
    }
    console.error("[intake] Unexpected error submitting form", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 502 });
  }
}
