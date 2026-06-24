import { Card } from "@pbh/ui";
import type { EnrollmentView } from "./register-and-enroll";

/**
 * Presentational results block — the participant id plus a card per campaign
 * with its assessment link. No hooks, so it renders in both the client form and
 * the server-rendered post-payment page.
 */
export function EnrollmentResults({
  participantId,
  enrollments,
}: {
  participantId: string;
  enrollments: EnrollmentView[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-on-surface-variant">
          Linus participant ID
        </p>
        <p className="font-mono text-sm break-all text-on-surface">
          {participantId}
        </p>
      </div>

      {enrollments.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {enrollments.map((enrollment) => (
            <li key={enrollment.campaignId}>
              <Card variant="bordered">
                <p className="text-lg font-semibold text-on-surface">
                  {enrollment.name}
                </p>
                <p className="font-mono text-xs break-all text-gray-500">
                  {enrollment.campaignId}
                </p>
                <a
                  href={enrollment.redirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-primary underline"
                >
                  Open assessment →
                </a>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card variant="bordered">
          <p className="text-on-surface">
            The subject was registered, but no campaigns are configured. Set the{" "}
            <code>LINUS_CAMPAIGNS</code> environment variable to add them.
          </p>
        </Card>
      )}
    </div>
  );
}
