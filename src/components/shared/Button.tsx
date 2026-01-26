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
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantColorStyles = {
    solid: {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      secondary:
        "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500",
      white: "bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
      dark: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700",
    },
    outline: {
      primary:
        "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
      secondary:
        "border-2 border-gray-800 text-gray-800 hover:bg-gray-50 focus:ring-gray-500",
      white:
        "border-2 border-white text-white hover:bg-white/10 focus:ring-white",
      dark: "border-2 border-gray-900 text-gray-900 hover:bg-gray-100 focus:ring-gray-700",
    },
    ghost: {
      primary: "text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
      secondary: "text-gray-800 hover:bg-gray-50 focus:ring-gray-500",
      white: "text-white hover:bg-white/10 focus:ring-white",
      dark: "text-gray-900 hover:bg-gray-100 focus:ring-gray-700",
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
