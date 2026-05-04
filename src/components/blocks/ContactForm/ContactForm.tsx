"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Section } from "@/components/shared/Section";

export interface ContactFormProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  tinaFields?: {
    headline?: string;
    subheadline?: string;
  };
}

export function ContactForm({
  headline,
  subheadline,
  buttonText = "Send Message",
  tinaFields,
}: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/thank-you/contact");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full bg-surface-container-low border-none rounded-lg px-3 py-3 sm:px-4 sm:py-4 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none";

  return (
    <Section
      id="contact"
      className="py-16 md:py-32 px-4 sm:px-6 md:px-16 bg-primary text-on-primary"
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
        {/* Left: Copy */}
        <div className="flex flex-col">
          {headline && (
            <h2
              data-scroll-item
              data-tina-field={tinaFields?.headline}
              className="text-4xl md:text-5xl lg:text-6xl font-normal font-headline mb-6 leading-[1.1] text-balance"
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              data-scroll-item
              data-tina-field={tinaFields?.subheadline}
              className="text-on-primary-container text-xl leading-relaxed text-pretty"
            >
              {subheadline}
            </p>
          )}
        </div>

        {/* Right: Form */}
        <div
          data-scroll-item
          className="bg-surface-container-lowest p-5 sm:p-8 md:p-10 rounded-[1.25rem] text-on-surface shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
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
                htmlFor="message"
                className="block text-sm font-semibold mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="How can we help?"
                className={inputClasses}
              />
            </div>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              size="lg"
              className="w-full text-balance shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : buttonText}
            </Button>
          </form>
        </div>
      </div>
    </Section>
  );
}
