import { Section, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { ctaSectionStyle, mutedStyle, paragraphStyle } from "../styles";
import { emailColors, emailFontStack } from "../theme";

export interface AssessmentReadyEmailProps {
  firstName: string;
  /** The enrolled campaigns to list, in display order. */
  assessments: Array<{ name: string; duration?: string }>;
  /** The funnel /assessments page (not the raw Linus redirect link). */
  assessmentsUrl: string;
}

/** Sent once enrollment lands: your assessments are ready to start. */
export function AssessmentReadyEmail({
  firstName,
  assessments,
  assessmentsUrl,
}: AssessmentReadyEmailProps) {
  return (
    <EmailLayout
      previewText="Your cognitive assessment is ready to begin."
      heading={`You're all set, ${firstName}`}
    >
      <Text style={paragraphStyle}>
        Your enrollment is complete and your assessment
        {assessments.length === 1 ? " is" : "s are"} ready whenever you are:
      </Text>
      <Section style={listStyle}>
        {assessments.map((assessment) => (
          <Text key={assessment.name} style={listItemStyle}>
            {assessment.name}
            {assessment.duration ? (
              <span style={durationStyle}> — about {assessment.duration}</span>
            ) : null}
          </Text>
        ))}
      </Section>
      <Text style={paragraphStyle}>
        Find a quiet spot, free of distractions, and take your time — there&apos;s
        no need to rush.
      </Text>
      <Section style={ctaSectionStyle}>
        <EmailButton href={assessmentsUrl}>Start your assessment</EmailButton>
      </Section>
      <Text style={mutedStyle}>
        Your progress is saved as you go, so you can sign back in and resume if
        you need a break.
      </Text>
    </EmailLayout>
  );
}

AssessmentReadyEmail.PreviewProps = {
  firstName: "Alex",
  assessments: [
    { name: "Core Cognitive Assessment", duration: "20 minutes" },
    { name: "Lifestyle Questionnaire", duration: "5 minutes" },
  ],
  assessmentsUrl: "https://primarybrainhealth.com/assessments",
} satisfies AssessmentReadyEmailProps;

export default AssessmentReadyEmail;

const listStyle: React.CSSProperties = {
  backgroundColor: emailColors.surfaceContainer,
  borderRadius: "12px",
  padding: "12px 20px",
  margin: "0 0 20px",
};

const listItemStyle: React.CSSProperties = {
  margin: "6px 0",
  fontFamily: emailFontStack,
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "22px",
  color: emailColors.onSurface,
};

const durationStyle: React.CSSProperties = {
  fontWeight: 400,
  color: emailColors.onSurfaceVariant,
};
