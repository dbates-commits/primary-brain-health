import { Heading, Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { ctaSectionStyle, headingStyle, mutedStyle, paragraphStyle } from "../styles";

export interface ReportReadyEmailProps {
  firstName: string;
  /** Which assessment produced the report (e.g. "Core Cognitive Assessment"). */
  assessmentName: string;
  /** The funnel /assessments page, where "View Report" lives. */
  assessmentsUrl: string;
}

/** Sent when a completed assessment's report becomes available. */
export function ReportReadyEmail({
  firstName,
  assessmentName,
  assessmentsUrl,
}: ReportReadyEmailProps) {
  return (
    <EmailLayout previewText="Your assessment report is ready to view.">
      <Heading style={headingStyle}>Your report is ready, {firstName}</Heading>
      <Text style={paragraphStyle}>
        The results from your {assessmentName} have been reviewed and your
        report is now available.
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
  assessmentsUrl: "https://primarybrainhealth.com/assessments",
} satisfies ReportReadyEmailProps;

export default ReportReadyEmail;
