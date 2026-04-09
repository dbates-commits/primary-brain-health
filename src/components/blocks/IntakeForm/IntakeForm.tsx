"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Heading } from "@/components/shared/Heading";
import { Section } from "@/components/shared/Section";

export interface IntakeFormProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  tinaFields?: {
    headline?: string;
    subheadline?: string;
  };
}

export function IntakeForm({
  headline,
  subheadline,
  buttonText = "Book a Consultation",
  tinaFields,
}: IntakeFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = "";
    if (digits.length > 0) formatted = `(${digits.slice(0, 3)}`;
    if (digits.length >= 4) formatted += `) ${digits.slice(3, 6)}`;
    if (digits.length >= 7) formatted += `-${digits.slice(6)}`;
    e.target.value = formatted;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      fullName: (form.elements.namedItem("fullName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      birthYear: (form.elements.namedItem("birthYear") as HTMLInputElement)
        .value,
      sex: (form.elements.namedItem("sex") as HTMLSelectElement).value,
      yearsOfEducation: (
        form.elements.namedItem("yearsOfEducation") as HTMLInputElement
      ).value,
      contactFor: (
        form.querySelector(
          'input[name="contactFor"]:checked'
        ) as HTMLInputElement
      )?.value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/thank-you");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none";

  return (
    <Section
      id="intake"
      className="py-24 md:py-32 px-8 md:px-16 bg-primary text-on-primary"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        {/* Left: Copy */}
        <div>
          {headline && (
            <h2
              data-scroll-item
              className="text-4xl md:text-6xl font-extrabold font-headline mb-8 leading-tight text-balance"
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              data-scroll-item
              className="text-on-primary-container text-xl leading-relaxed mb-8 text-pretty"
              data-tina-field={tinaFields?.subheadline}
            >
              {subheadline}
            </p>
          )}
          <div data-scroll-item className="p-8 bg-primary-container rounded-xl">
            <Heading as="h4" size="sm" className="mb-4 text-white">
              Includes:
            </Heading>
            <ul className="space-y-4 text-on-primary-container">
              {[
                "Digital brain health assessment",
                "Clinician review of your results",
                "Consultation to collect relevant health history",
                "Clear explanation of findings and risk profile",
                "Personalized recommendations and next steps",
                "Optional support from a Brain Health Navigator",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-secondary-fixed mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-white/15">
              <span className="text-3xl font-bold text-white font-headline">$149</span>
              <p className="text-on-primary-container/80 text-sm mt-2">
                This service may be eligible for HSA/FSA reimbursement. We can provide documentation to support submission.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div data-scroll-item className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] text-on-surface shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold mb-2"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  onChange={handlePhoneInput}
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="birthYear"
                  className="block text-sm font-semibold mb-2"
                >
                  Birth Year
                </label>
                <div className="relative">
                  <select
                    id="birthYear"
                    name="birthYear"
                    required
                    className={cn(inputClasses, "appearance-none pr-10")}
                  >
                    <option value="">Select year</option>
                    {birthYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-semibold mb-2"
                >
                  Sex
                </label>
                <div className="relative">
                  <select
                    id="sex"
                    name="sex"
                    required
                    className={cn(inputClasses, "appearance-none pr-10")}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div>
                <label
                  htmlFor="yearsOfEducation"
                  className="block text-sm font-semibold mb-2"
                >
                  Years of Education
                </label>
                <input
                  id="yearsOfEducation"
                  name="yearsOfEducation"
                  type="number"
                  min="0"
                  max="30"
                  required
                  placeholder="16"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Who is this consultation for?
              </label>
              <div className="flex gap-4">
                <label className="relative flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="contactFor"
                    value="self"
                    className="peer sr-only"
                  />
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-on-surface-variant/40 peer-checked:border-secondary transition-colors after:block after:w-2.5 after:h-2.5 after:rounded-full after:bg-secondary after:scale-0 after:transition-transform peer-checked:after:scale-100" />
                  <span className="text-sm">Myself</span>
                </label>
                <label className="relative flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="contactFor"
                    value="someone-else"
                    className="peer sr-only"
                  />
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-on-surface-variant/40 peer-checked:border-secondary transition-colors after:block after:w-2.5 after:h-2.5 after:rounded-full after:bg-secondary after:scale-0 after:transition-transform peer-checked:after:scale-100" />
                  <span className="text-sm">Someone Else</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold mb-2"
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us more about your concerns..."
                className={inputClasses}
              />
            </div>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              size="lg"
              className="w-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : buttonText}
            </Button>
          </form>
        </div>
      </div>
    </Section>
  );
}
