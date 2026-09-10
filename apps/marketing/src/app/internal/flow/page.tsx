import {
  DIAGRAM_EYEBROW,
  DIAGRAM_LEDE,
  DIAGRAM_LEGEND,
  DIAGRAM_TITLE,
  SequenceFlow,
} from "@/components/flow";

export const metadata = {
  title: "Booking flow — Primary Brain Health",
  robots: { index: false, follow: false },
};

/**
 * Stakeholder view of the booking flow as a sequence diagram, mirroring the
 * Figma board "PBH — Overview". Internal, like the email previews next door:
 * it describes the flow, it is not part of it.
 */
export default function BookingFlowDiagramPage() {
  return (
    // 5rem is the site header above this page — take it off so the canvas
    // fills the rest of the viewport instead of pushing the page into a scroll.
    <div className="flex h-[calc(100dvh-5rem)] flex-col bg-background-warm">
      <header className="shrink-0 px-8 pt-8 pb-5">
        <p className="text-[11px] font-semibold tracking-widest text-brand-default uppercase">
          {DIAGRAM_EYEBROW}
        </p>
        <h1 className="mt-2 font-headline text-3xl text-text-heading">
          {DIAGRAM_TITLE}
        </h1>
        <p className="mt-2 max-w-4xl text-body-sm text-text-default">
          {DIAGRAM_LEDE}{" "}
          <span className="text-aqua-default">{DIAGRAM_LEGEND}</span>
        </p>
      </header>
      <div className="min-h-0 flex-1 border-t border-border-default">
        <SequenceFlow />
      </div>
    </div>
  );
}
