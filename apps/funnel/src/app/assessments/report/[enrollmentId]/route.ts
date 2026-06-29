import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { linusEnrollments, users } from "@/db/schema";
import { extractReportData, getReport } from "@/lib/linus/client";
import { getCampaigns } from "@/lib/linus/campaigns";
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
 * A self-contained HTML page shown in the opened tab when there's no PDF to
 * stream — so the user never sees a raw 400/404 from us or from Linus. `status`
 * keeps the response semantically correct while the body stays friendly.
 */
function messagePage(title: string, body: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fbf9f4;
        color: #041632; display: grid; place-items: center; min-height: 100vh; }
      main { max-width: 28rem; padding: 2rem; text-align: center; }
      h1 { font-weight: 300; font-size: 1.5rem; margin: 0 0 0.5rem; }
      p { color: #446558; line-height: 1.5; margin: 0 0 1.5rem; }
      a { display: inline-block; background: #006e8a; color: #fff;
        text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 9999px;
        font-weight: 600; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${body}</p>
      <a href="/assessments">Back to assessments</a>
    </main>
  </body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Streams a subject's report PDF so a card's "View Report" can open it in a new
 * tab. Auth is the same short-lived cookie the page uses; the report is fetched
 * server-side under the cookie user's own participantId, so a user can only read
 * reports under their own subject.
 *
 * Every state is resolved here, server-side, and rendered as a friendly page
 * rather than leaking a raw upstream error to the browser:
 *  - no/expired cookie  → bounce back to /assessments (re-auth via the page).
 *  - unknown user        → "report unavailable".
 *  - Linus says the report isn't ready yet (commonly a 400/404/202) → a
 *    "still generating" page, not a hard error.
 *  - report ready        → stream the PDF inline.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  const { enrollmentId } = await params;

  const uid = (await cookies()).get(ASSESSMENT_UID_COOKIE)?.value;
  if (!uid) {
    // Session cookie missing/expired — send them to the page to re-establish it.
    return Response.redirect(new URL("/assessments", req.url), 302);
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
    return messagePage(
      "Report unavailable",
      "We couldn't find an assessment account for you yet.",
      404,
    );
  }

  let report: unknown;
  try {
    report = await getReport(user.participantId, enrollmentId, "patient-report");
  } catch {
    // Linus returns a non-2xx (often 400/404) while a report is still being
    // generated. Treat that as "not ready" rather than a hard failure.
    return messagePage(
      "Report not ready yet",
      "Your report is still being generated. Please check back in a little while.",
      202,
    );
  }

  const base64 = extractReportData(report);
  if (!base64) {
    return messagePage(
      "Report not ready yet",
      "Your report is still being generated. Please check back in a little while.",
      202,
    );
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
      [`${user.firstName} ${user.lastName}`, campaignKey, "brain health report"]
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
