import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing the use of Primary Brain Health clinical services, digital interfaces, and cognitive assessment tools.",
};

export default function TermsPage() {
  return (
    <main className="pt-12 pb-24 px-6">
      <article className="max-w-3xl mx-auto [&_p]:text-lg [&_p]:leading-[2] [&_p]:text-primary/90 [&_p]:mb-8 [&_h2]:mt-16 [&_h2]:mb-6 [&_li]:text-lg [&_li]:leading-[1.8] [&_li]:text-on-surface-variant">
        {/* Header */}
        <header className="mb-16">
          <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-4 block font-headline">
            Legal Documentation
          </span>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight mb-6">
            Terms &amp; Conditions
          </h1>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Last Updated: November 14, 2024
          </div>
        </header>

        {/* Content */}
        <section>
          <h2 className="font-headline text-3xl font-bold text-on-surface">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the clinical services, digital interfaces, and
            cognitive assessment tools provided by Primary Brain Health (the
            &ldquo;Sanctuary,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;), you signify your irrevocable agreement to be
            bound by these Terms &amp; Conditions. These terms constitute a
            legally binding agreement between you and our healthcare collective.
          </p>
          <p>
            If you do not agree to these terms, you must immediately cease all
            use of our services. Your continued engagement with our practitioners
            or digital platforms signifies your ongoing acceptance of these
            evolving protocols.
          </p>

          <h2 className="font-headline text-3xl font-bold text-on-surface">
            2. Use of Service
          </h2>
          <p>
            Our services are designed for proactive brain health management and
            neuro-restorative guidance. All content, including neural health
            tips, cognitive assessments, and therapeutic recommendations, is
            intended for informational and rehabilitative purposes.
          </p>
          <ul className="list-disc pl-6 space-y-4 mb-8">
            <li>
              Access is granted solely for personal, non-commercial use by
              individuals seeking cognitive optimization.
            </li>
            <li>
              Users must provide accurate, current, and complete health data
              during the intake process.
            </li>
            <li>
              The Sanctuary reserves the right to modify service protocols based
              on emerging neuro-scientific evidence.
            </li>
          </ul>

          <h2 className="font-headline text-3xl font-bold text-on-surface">
            3. User Responsibilities
          </h2>
          <p>
            Maintaining the integrity of your cognitive journey requires active
            participation and transparency. You are responsible for the
            confidentiality of any neuro-assessment credentials and for all
            activities that occur under your patient profile.
          </p>
          <p>
            You agree not to utilize any automated systems (including
            &ldquo;deep-linking,&rdquo; &ldquo;page-scraping,&rdquo; or
            &ldquo;robots&rdquo;) to access or monitor our proprietary cognitive
            protocols. Any attempt to bypass the visual or structural integrity
            of the Cognitive Sanctuary interface is strictly prohibited.
          </p>

          <h2 className="font-headline text-3xl font-bold text-on-surface">
            4. Limitation of Liability
          </h2>
          <p>
            While we strive for the highest clinical precision, Primary Brain
            Health and its neuro-specialists shall not be liable for any
            indirect, incidental, special, or consequential damages resulting
            from the use or inability to use our cognitive services.
          </p>
          <p className="!italic !text-on-surface-variant border-l-2 border-secondary/30 pl-6 py-2">
            The total liability of the Sanctuary for any claim arising out of or
            relating to these terms shall not exceed the amount paid by the user
            for the specific consultation or service cycle in question.
          </p>

          <h2 className="font-headline text-3xl font-bold text-on-surface">
            5. Governing Law
          </h2>
          <p>
            These Terms &amp; Conditions and your use of our Sanctuary shall be
            governed by and construed in accordance with the laws of the
            jurisdiction in which our primary clinical headquarters is situated,
            without regard to its conflict of law provisions.
          </p>
          <p>
            Any legal action or proceeding related to your access to, or use of,
            our services shall be instituted in a state or federal court in the
            aforementioned jurisdiction. You and Primary Brain Health agree to
            submit to the jurisdiction of, and agree that venue is proper in,
            these courts.
          </p>
        </section>

        {/* Contact CTA */}
        <div className="mt-24 pt-12 text-center border-t border-outline-variant/20">
          <p className="!text-base text-on-surface-variant mb-4">
            Have questions regarding these terms?
          </p>
          <a
            className="font-headline font-bold text-secondary inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            href="mailto:legal@primarybrainhealth.com"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            legal@primarybrainhealth.com
          </a>
        </div>
      </article>
    </main>
  );
}
