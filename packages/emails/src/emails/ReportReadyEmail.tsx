import { Section, Text } from "react-email";
import { copyFor, type Track } from "@pbh/copy";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";

export interface ReportReadyEmailProps {
  firstName: string;
  /** Which assessment produced the report (e.g. "Core Cognitive Assessment"). */
  assessmentName: string;
  /**
   * The track the assessment was produced under. Passed in explicitly rather
   * than derived at render: a sent email is a snapshot of what was true when it
   * went out, and re-deriving would let a later upgrade change the wording of
   * mail already in someone's inbox preview.
   */
  track: Track;
  /** The funnel /assessments page, where "View Report" lives. */
  assessmentsUrl: string;
}

/** Sent when a completed assessment's report becomes available. */
export function ReportReadyEmail({
  firstName,
  assessmentName,
  track,
  assessmentsUrl,
}: ReportReadyEmailProps) {
  const copy = copyFor({ track });
  return (
    <EmailLayout
      previewText="Your assessment report is ready to view."
      heading={`Your report is ready, ${firstName}`}
    >
      <Text style={paragraphStyle}>
        {copy.phrase("email.reportReady.body", { assessmentName })}
      </Text>
      <Section style={ctaSectionStyle}>
        <EmailButton href={assessmentsUrl}>View your report</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        For your privacy, the report isn&apos;t attached to this email —
        sign in to view or download it securely.
      </Text>
    </EmailLayout>
  );
}

ReportReadyEmail.PreviewProps = {
  firstName: "Alex",
  assessmentName: "Core Cognitive Assessment",
  track: "wellness",
  assessmentsUrl: "https://primarybrainhealth.com/assessments",
} satisfies ReportReadyEmailProps;

export default ReportReadyEmail;
