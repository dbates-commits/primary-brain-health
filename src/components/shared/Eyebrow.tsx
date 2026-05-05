import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  /** Color token. Defaults to `primary` (the "Why Primary Brain Health?" style). */
  color?: "primary" | "secondary";
  /** Underlying element. Defaults to `<p>`. */
  as?: "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  "data-tina-field"?: string;
}

/**
 * Section eyebrow / kicker label — the small all-caps tracked text that
 * sits above a headline ("Why Primary Brain Health?", "Restorative Care",
 * etc.). Captures the shared typography so it stays consistent everywhere.
 */
export function Eyebrow({
  children,
  color = "primary",
  as: Comp = "p",
  className,
  style,
  "data-tina-field": tinaField,
}: EyebrowProps) {
  return (
    <Comp
      className={cn(
        "text-lg font-body font-bold uppercase tracking-[0.18em]",
        color === "primary" ? "text-primary" : "text-secondary",
        className
      )}
      style={style}
      data-tina-field={tinaField}
    >
      {children}
    </Comp>
  );
}
