import { cn } from "./utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  hover = false,
}: CardProps) {
  const variantStyles = {
    default: "bg-background-default rounded-form-card",
    elevated: "bg-background-default rounded-form-card shadow-card",
    bordered: "bg-background-default rounded-form-card border border-border-subtle",
    ghost: "bg-transparent",
  };

  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        hover && "transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ children, className, as: Tag = "h3" }: CardTitleProps) {
  return (
    <Tag className={cn("text-subtitle font-semibold text-ink-strong", className)}>
      {children}
    </Tag>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn("text-text-default", className)}>{children}</p>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn(className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("mt-4 pt-4 border-t border-border-subtle", className)}>{children}</div>;
}
