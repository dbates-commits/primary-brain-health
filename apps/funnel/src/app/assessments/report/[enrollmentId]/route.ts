import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { extractReportData, getReport } from "@/lib/linus/client";
import { ASSESSMENT_UID_COOKIE } from "@/app/assessments/register-and-enroll";

/**
 * Streams a subject's report PDF so a card's "View Report" can open it in a new
 * tab. Auth is the same short-lived cookie the page uses; the report is fetched
 * under the cookie user's own participantId, so a mismatched enrollmentId just
 * 404s from Linus — a user can only read reports under their own subject.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  const { enrollmentId } = await params;

  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  if (!uid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [user] = await db
    .select({ participantId: users.linusParticipantId })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  if (!user?.participantId) {
    return new Response("Not found", { status: 404 });
  }

  let report: unknown;
  try {
    report = await getReport(user.participantId, enrollmentId, "patient-report");
  } catch {
    return new Response("Report unavailable", { status: 404 });
  }

  const base64 = extractReportData(report);
  if (!base64) {
    return new Response("Report unavailable", { status: 404 });
  }

  return new Response(Buffer.from(base64, "base64"), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="report.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
