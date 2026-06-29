import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { linusEnrollments, users } from "@/db/schema";
import { extractReportData, getReport } from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/env";
import { ASSESSMENT_UID_COOKIE } from "@/app/assessments/register-and-enroll";

/** ASCII-safe, hyphenated slug for a Content-Disposition filename. */
function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

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
    .select({
      participantId: users.linusParticipantId,
      firstName: users.firstName,
      lastName: users.lastName,
    })
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

  // Build a descriptive filename: "<name>-<assessment>-brain-health-report.pdf".
  // The assessment label comes from the campaign behind this enrollment; fall
  // back gracefully if the row or campaign config is missing.
  const [row] = await db
    .select({ campaignId: linusEnrollments.campaignId })
    .from(linusEnrollments)
    .where(
      and(
        eq(linusEnrollments.userId, uid),
        eq(linusEnrollments.enrollmentId, enrollmentId),
      ),
    )
    .limit(1);
  const campaignKey = getCampaigns().find(
    (c) => c.campaignId === row?.campaignId,
  )?.key;
  const filename =
    slugify(
      [
        `${user.firstName} ${user.lastName}`,
        campaignKey,
        "brain health report",
      ]
        .filter(Boolean)
        .join(" "),
    ) + ".pdf";

  return new Response(Buffer.from(base64, "base64"), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
