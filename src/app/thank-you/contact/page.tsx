import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Message Received",
  description:
    "Thanks for reaching out to Primary Brain Health. We'll be in touch.",
};

export default function ContactThankYouPage() {
  return (
    <div className="flex-grow flex items-center justify-center px-6 py-24 md:py-32">
      <div className="w-full max-w-xl text-center">
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
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 text-pretty">
          We&apos;ve received your message. Someone from our team will get back
          to you within one business day.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold transition-all hover:brightness-110 shadow-lg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
