import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";
type HeadingSize = "xl" | "lg" | "md" | "sm";

interface HeadingProps {
  as?: HeadingLevel;
  size?: HeadingSize;
  children: React.ReactNode;
  className?: string;
  "data-tina-field"?: string;
  "data-scroll-item"?: boolean;
}

const sizeStyles: Record<HeadingSize, string> = {
  xl: "text-4xl md:text-5xl lg:text-6xl",
  lg: "text-4xl md:text-5xl",
  md: "text-3xl md:text-4xl",
  sm: "text-2xl md:text-3xl",
};

export function Heading({
  as: Tag = "h2",
  size = "lg",
  children,
  className,
  "data-tina-field": tinaField,
  "data-scroll-item": scrollItem,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        "font-headline font-bold text-on-surface",
        sizeStyles[size],
        className
      )}
      data-tina-field={tinaField}
      data-scroll-item={scrollItem}
    >
      {children}
    </Tag>
  );
}
