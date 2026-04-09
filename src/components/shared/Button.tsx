import { cn } from "@/lib/utils";
import Link from "next/link";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  children: React.ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "secondary" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  "data-tina-field"?: string;
}

export function Button({
  children,
  href,
  variant = "solid",
  color = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  "data-tina-field": tinaField,
  ...rest
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-headline font-bold rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantColorStyles = {
    solid: {
      primary:
        "bg-primary text-on-primary hover:brightness-110 focus:ring-primary",
      secondary:
        "bg-secondary text-on-secondary hover:brightness-110 focus:ring-secondary",
      white: "bg-white text-on-surface hover:bg-surface-container-low focus:ring-outline",
      dark: "bg-on-surface text-surface hover:brightness-125 focus:ring-on-surface",
    },
    outline: {
      primary:
        "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary",
      secondary:
        "border-2 border-secondary text-secondary hover:bg-secondary/5 focus:ring-secondary",
      white:
        "border-2 border-white text-white hover:bg-white/10 focus:ring-white",
      dark: "border-2 border-on-surface text-on-surface hover:bg-on-surface/5 focus:ring-on-surface",
    },
    ghost: {
      primary: "text-primary hover:bg-primary/5 focus:ring-primary",
      secondary: "text-secondary hover:bg-secondary/5 focus:ring-secondary",
      white: "text-white hover:bg-white/10 focus:ring-white",
      dark: "text-on-surface hover:bg-on-surface/5 focus:ring-on-surface",
    },
  };

  const styles = cn(
    baseStyles,
    sizeStyles[size],
    variantColorStyles[variant][color],
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles} data-tina-field={tinaField} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={styles} data-tina-field={tinaField} {...rest}>
      {children}
    </button>
  );
}
