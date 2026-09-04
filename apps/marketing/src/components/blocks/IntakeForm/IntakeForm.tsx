"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@pbh/ui/utils";
import { Button } from "@pbh/ui";
import { PhosphorIcon } from "@pbh/ui";
import { Section } from "@pbh/ui";

export interface IntakeFormProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonTextMobile?: string;
  showIncludes?: boolean;
  tinaFields?: {
    headline?: string;
    subheadline?: string;
  };
}

export function IntakeForm({
  headline,
  subheadline,
  buttonText = "Book a Consultation",
  buttonTextMobile,
  showIncludes = true,
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
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      yearOfBirth: (form.elements.namedItem("yearOfBirth") as HTMLSelectElement)
        .value,
      gender: (form.elements.namedItem("gender") as HTMLSelectElement).value,
      educationLevel: (
        form.elements.namedItem("educationLevel") as HTMLSelectElement
      ).value,
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
    "w-full bg-surface-container-low border-none rounded-lg px-3 py-3 sm:px-4 sm:py-4 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none";

  return (
    <Section
      id="intake"
      className="py-16 md:py-32 px-6 md:px-10 bg-primary text-on-primary"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        {/* Left: Copy */}
        <div className="flex flex-col">
          {headline && (
            <h2
              data-scroll-item
              className="text-4xl md:text-5xl lg:text-6xl font-thin font-headline mb-6 leading-[1.1] text-balance"
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
          {showIncludes && (
            /* The frame's panel: a darker ground than the section, seals and
               bullet copy in the same wash, then price and terms under a rule.
               Radius stays at the section's 1.25rem so it matches the form
               card beside it rather than the design-system default. */
            <div
              data-scroll-item
              className="flex flex-1 flex-col gap-10 rounded-[1.25rem] bg-brand-850 p-6 sm:p-8"
            >
              <div className="flex flex-col gap-4">
                <h3 className="font-headline text-subtitle font-thin leading-none text-text-inverse">
                  Includes
                </h3>
                <ul className="flex flex-col gap-4">
                  {[
                    "Digital brain health assessment.",
                    "Professional review of your results.",
                    "Consultation to collect relevant health history.",
                    "Clear explanation of findings and risk profile.",
                    "Personalized recommendations and next steps.",
                    "Optional support from a Brain Health Coach.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <PhosphorIcon
                        name="SealCheck"
                        aria-hidden="true"
                        size={24}
                        weight="regular"
                        className="shrink-0 text-brand-wash"
                      />
                      <span className="text-brand-wash">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pushed to the panel's base so the price sits against it
                  however many bullets the list carries. */}
              <div className="mt-auto flex flex-col gap-4">
                <hr className="border-t border-border-inverse/20" />
                <p className="font-headline text-h2 font-thin leading-none text-text-inverse">
                  $149
                </p>
                <p className="text-caption leading-normal text-brand-wash">
                  This service may be eligible for{" "}
                  <span className="text-text-inverse">HSA/FSA reimbursement</span>, depending
                  on your plan. We can provide documentation to support submission.
                </p>
                <p className="text-caption font-bold leading-normal text-brand-wash">
                  Full refund within 14 days if you haven&apos;t started.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div data-scroll-item className="bg-surface-container-lowest p-5 sm:p-8 md:p-10 rounded-[1.25rem] text-on-surface shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  placeholder="Jane"
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  placeholder="Doe"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
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
                  autoComplete="email"
                  required
                  placeholder="jane@example.com"
                  className={inputClasses}
                />
              </div>
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
                  autoComplete="tel"
                  required
                  placeholder="(555) 000-0000"
                  onChange={handlePhoneInput}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="yearOfBirth"
                  className="block text-sm font-semibold mb-2"
                >
                  Year of Birth
                </label>
                <div className="relative">
                  <select
                    id="yearOfBirth"
                    name="yearOfBirth"
                    required
                    defaultValue=""
                    className={cn(inputClasses, "appearance-none pr-10")}
                  >
                    <option value="" disabled>
                      Select year
                    </option>
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
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-semibold mb-2"
                >
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    required
                    defaultValue=""
                    className={cn(inputClasses, "appearance-none pr-10")}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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

            <div>
              <label
                htmlFor="educationLevel"
                className="block text-sm font-semibold mb-2"
              >
                Highest Level of Education
              </label>
              <div className="relative">
                <select
                  id="educationLevel"
                  name="educationLevel"
                  required
                  defaultValue=""
                  className={cn(inputClasses, "appearance-none pr-10")}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Less than high school">
                    Less than high school
                  </option>
                  <option value="High school graduate">
                    High school graduate
                  </option>
                  <option value="Associates (2 years)">
                    Associates (2 years)
                  </option>
                  <option value="Bachelors (4 years)">
                    Bachelors (4 years)
                  </option>
                  <option value="Masters (6 years)">
                    Masters (6 years)
                  </option>
                  <option value="Doctorate (8+ years)">
                    Doctorate (8+ years)
                  </option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              size="lg"
              className="w-full text-balance shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                "Submitting..."
              ) : (
                <>
                  <span className="sm:hidden">
                    {buttonTextMobile || buttonText}
                  </span>
                  <span className="hidden sm:inline">{buttonText}</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Section>
  );
}
