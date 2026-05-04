import type { Metadata } from "next";
import Link from "next/link";

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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdI6xP2qNT0_fckY7ur-SislKKwDjM5J3Osc6aAaUm6HmNIp-Cml1hD9k8WfD_SL5vF83bHyjqx9IWsecgEro3OwhgZWodQxQJBgwW-gRhzqcalFR9okDkQ-LbvOPcrEN5r_tfY0PJrIV1iW6Ugkj3ZcO4JUsC9nLhBGxX6xxqA9nWBqWBmvAuZ03oADig6qqtczaoDeo3zreKmDu5BswrIzMtiX1j_8etm3yJgeEXB0pe8GvY-IViH7A-_11ZdNwDY8ZjQOT4H1w"
              alt="Serene older man sitting in a sunlit garden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="bg-surface-container-lowest/90 backdrop-blur-md p-8 rounded-[1.5rem] border border-white/20 shadow-xl">
                <p className="text-secondary font-bold text-sm uppercase tracking-[0.2em] mb-3 font-headline">
                  Restorative Care
                </p>
                <h3 className="text-3xl font-bold text-on-surface mb-3 font-headline leading-tight">
                  A focused approach to your vitality.
                </h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
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
              <h2 className="text-3xl font-bold text-on-surface mb-8 flex items-center gap-3 font-headline">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                  />
                </svg>
                Next Steps
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-headline text-base">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-headline">
                      Initial Review
                    </p>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      An intake specialist will review your information to match
                      you with the right clinical specialist.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-headline text-base">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-headline">
                      Personal Outreach
                    </p>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      Expect a call from our care coordination team within 24-48
                      business hours to discuss your needs.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-headline text-base">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg mb-1 font-headline">
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

            {/* CTA Card */}
            <div className="bg-primary text-on-primary p-10 rounded-[2rem] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold font-headline mb-4 leading-tight">
                  Curious about our process?
                </h3>
                <p className="text-on-primary-container text-base mb-8 opacity-90 leading-relaxed">
                  Explore our resource library for data-driven insights on
                  proactive cognitive health.
                </p>
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                <Link
                  href="/#about"
                  className="bg-secondary text-on-secondary px-8 py-4 rounded-full font-headline font-bold text-center transition-all hover:brightness-110 shadow-lg"
                >
                  Learn More
                </Link>
                <Link
                  href="/"
                  className="text-on-primary-container border border-on-primary-container/30 px-8 py-4 rounded-full font-headline font-bold text-center hover:bg-white/5 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
