import { cn } from "./utils";

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
  xl: "text-4xl md:text-h2 lg:text-6xl leading-[1.1]",
  lg: "text-3xl md:text-4xl lg:text-h2 leading-[1.15]",
  md: "text-h5 md:text-3xl leading-[1.2]",
  sm: "text-subtitle md:text-h5 leading-[1.25]",
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
        "font-headline font-normal text-ink-strong",
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
