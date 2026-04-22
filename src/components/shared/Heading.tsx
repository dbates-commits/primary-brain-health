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
  xl: "text-4xl md:text-5xl lg:text-6xl leading-[1.1]",
  lg: "text-3xl md:text-4xl lg:text-5xl leading-[1.15]",
  md: "text-2xl md:text-3xl leading-[1.2]",
  sm: "text-xl md:text-2xl leading-[1.25]",
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
        "font-headline font-normal text-on-surface",
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
