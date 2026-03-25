"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      birthYear: (form.elements.namedItem("birthYear") as HTMLInputElement).value,
      sex: (form.elements.namedItem("sex") as HTMLSelectElement).value,
      yearsOfEducation: (form.elements.namedItem("yearsOfEducation") as HTMLInputElement).value,
      contactFor: (form.elements.namedItem("contactFor") as HTMLSelectElement).value,
    };

    try {
      await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="intake" className="py-20 bg-gray-50">
        <Container size="narrow">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              We&apos;ve received your information and will reach out within 24 hours to schedule your consultation.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const inputClasses =
    "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <section id="intake" className="py-20 bg-gray-50">
      <Container size="narrow">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {headline && (
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3"
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              className="text-lg text-gray-600 text-center mb-10 max-w-xl mx-auto"
              data-tina-field={tinaFields?.subheadline}
            >
              {subheadline}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className={labelClasses}>
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClasses}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClasses}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="birthYear" className={labelClasses}>
                  Birth Year
                </label>
                <input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  min="1920"
                  max="2010"
                  placeholder="e.g. 1975"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="sex" className={labelClasses}>
                  Sex
                </label>
                <select id="sex" name="sex" required className={cn(inputClasses, "appearance-none")}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label htmlFor="yearsOfEducation" className={labelClasses}>
                  Years of Education
                </label>
                <input
                  id="yearsOfEducation"
                  name="yearsOfEducation"
                  type="number"
                  min="0"
                  max="30"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactFor" className={labelClasses}>
                Are you contacting on behalf of yourself or someone else?
              </label>
              <select id="contactFor" name="contactFor" required className={cn(inputClasses, "appearance-none")}>
                <option value="">Select...</option>
                <option value="self">Myself</option>
                <option value="someone-else">Someone else</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : buttonText}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
