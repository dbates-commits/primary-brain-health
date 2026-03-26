import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Primary Brain Health",
  description:
    "Learn how Primary Brain Health protects your sensitive health information with clinical rigor and HIPAA-compliant practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-12 pb-24 px-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-16">
        <span className="text-on-surface-variant text-sm tracking-widest uppercase mb-4 block">
          Legal Documentation
        </span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight mb-6">
          Privacy Policy
        </h1>
        <div className="flex items-center gap-2 text-on-surface-variant font-medium">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">Last Updated: October 24, 2024</p>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-12 [&_p]:text-lg [&_p]:leading-[2] [&_p]:text-primary/85 [&_li]:text-lg [&_li]:leading-[1.8] [&_li]:text-primary/85">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Introduction
          </h2>
          <p>
            At Primary Brain Health, we view cognitive wellness as a sacred
            trust. This Privacy Policy outlines how we treat your sensitive
            information with the same clinical rigor and restorative care that we
            apply to our therapeutic practices. Your privacy is the bedrock of
            our sanctuary.
          </p>
        </section>

        {/* Information Collection */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Information Collection
          </h2>
          <p className="mb-6">
            We collect information that allows us to provide personalized
            neurological care and support. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-4">
            <li>
              <strong>Personal Identifiers:</strong> Legal name, date of birth,
              and contact information used for clinical scheduling.
            </li>
            <li>
              <strong>Health Information:</strong> Cognitive assessment data,
              medical history, and neural biometric markers collected through our
              secure diagnostic tools.
            </li>
            <li>
              <strong>Technical Data:</strong> IP addresses and session logs
              collected purely for the security and optimization of our digital
              platform.
            </li>
          </ul>
        </section>

        {/* Data Usage */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Data Usage
          </h2>
          <p className="mb-6">
            Your data is utilized solely for the advancement of your cognitive
            health journey. We utilize clinical insights to:
          </p>
          <ul className="list-disc pl-6 space-y-4 mb-6">
            <li>
              <strong>Clinical Planning:</strong> Developing custom neural
              stimulation and cognitive health protocols.
            </li>
            <li>
              <strong>Security Monitoring:</strong> Protecting our clinical
              database against unauthorized access attempts.
            </li>
          </ul>
          <p className="!italic !text-on-surface-variant border-l-2 border-secondary/30 pl-4">
            We do not, under any circumstances, sell your health data to
            third-party advertisers or data brokers.
          </p>
        </section>

        {/* Privacy Rights */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Your Privacy Rights
          </h2>
          <p className="mb-6">
            Under protected health information regulations, you maintain absolute
            control over your records. You have the right to request access,
            correction, or deletion of your data at any time through our patient
            portal.
          </p>
          <p>
            To exercise these rights, please log in to your account or contact
            our compliance office using the details provided below.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Cookies and Technical Tracking
          </h2>
          <p>
            Our platform uses &ldquo;essential cookies&rdquo; to maintain secure
            sessions and &ldquo;analytical cookies&rdquo; to understand how users
            interact with our cognitive resources. You may manage these
            preferences through your browser settings, though some clinical
            features may be limited.
          </p>
        </section>

        {/* Third-Party */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">
            Third-Party Disclosure
          </h2>
          <p>
            We only share data with HIPAA-compliant cloud storage providers and
            diagnostic partners necessary for your treatment. All third-party
            partners are bound by strict confidentiality agreements that mirror
            our internal security standards.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-12 border-t border-outline-variant/30">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-headline font-bold text-primary mb-4">
                Legal Contact
              </h3>
              <div className="space-y-1 text-on-surface-variant">
                <p className="!text-base">
                  Primary Brain Health Compliance Office
                </p>
                <p className="!text-base">1200 Neural Way, Ste 400</p>
                <p className="!text-base">San Francisco, CA 94105</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold text-primary mb-4">
                Electronic Inquiry
              </h3>
              <p className="!text-base text-on-surface-variant mb-2">
                For privacy-related questions:
              </p>
              <a
                className="text-secondary font-bold underline underline-offset-4 hover:text-primary transition-colors"
                href="mailto:privacy@primarybrainhealth.com"
              >
                privacy@primarybrainhealth.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
