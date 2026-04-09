import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
}

export function Section({
  children,
  className,
  id,
  stagger,
}: SectionProps) {
  return (
    <section
      id={id}
      data-scroll-reveal
      {...(stagger !== undefined && { "data-scroll-stagger": stagger })}
      className={cn("scroll-mt-20", className)}
    >
      {children}
    </section>
  );
}
