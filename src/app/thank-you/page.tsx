import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/Eyebrow";

export const metadata: Metadata = {
  title: "Request Received",
  description:
    "Your consultation request has been successfully received by Primary Brain Health.",
};

export default function ThankYouPage() {
  return (
    <div className="flex-grow pb-20 px-6 neural-texture">
      <div className="max-w-7xl mx-auto">
        {/* Success Header — matched to /thank-you/contact for visual
            consistency. Heading and icon are smaller and lighter; the
            rich next-steps content sits below. */}
        <section className="text-center pt-24 md:pt-32 pb-12 md:pb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-container text-secondary rounded-full mb-8">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-normal font-headline text-on-surface leading-[1.1] mb-5 text-balance">
            Thank you for reaching out
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto text-pretty">
            Your request for a brain health consultation has been received. We
            are honored to support you on your journey toward cognitive clarity
            and wellness.
          </p>
        </section>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Image Section */}
          <div className="lg:col-span-7 rounded-[2.5rem] overflow-hidden relative min-h-[500px] shadow-2xl">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/uploads/group-walking-outside@2x.jpg"
              alt="A small group walking together outdoors"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="bg-surface-container-lowest/90 backdrop-blur-md p-8 rounded-[1.5rem] border border-white/20 shadow-xl">
                <Eyebrow className="mb-3">Restorative Care</Eyebrow>
                <h3 className="text-3xl font-bold text-on-surface mb-3 font-headline leading-tight">
                  A focused approach to your vitality.
                </h3>
                <p className="text-on-surface-variant text-lg leading-relaxed text-balance">
                  Our specialists treat every case with clinical precision and
                  personal empathy.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Next Steps Card */}
            <div className="bg-surface-container-low p-10 rounded-[2rem] flex-grow shadow-sm border border-outline-variant/10">
              <h2 className="text-3xl font-bold text-on-surface mb-8 font-headline">
                Next Steps
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-body text-base">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-body">
                      Initial Review
                    </p>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      An intake specialist will review your information to match
                      you with the right clinical specialist.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-body text-base">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-body">
                      Personal Outreach
                    </p>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      Expect a call from our care coordination team within 24-48
                      business hours to discuss your needs.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-body text-base">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-body">
                      Scheduling
                    </p>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      We will finalize your consultation date and provide clear
                      pre-visit instructions.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
