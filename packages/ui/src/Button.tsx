import { cn } from "./utils";
import Link from "next/link";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  children: React.ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "secondary" | "white" | "dark" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
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
  disabled = false,
  onClick,
  type = "button",
  "data-tina-field": tinaField,
  ...rest
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-body font-bold rounded-full transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // No `pointer-events-none` here: it would suppress the `cursor-not-allowed`
  // hover cursor. Clicks are already blocked by the native `disabled` attribute.
  const disabledStyles =
    "opacity-50 cursor-not-allowed active:scale-100 hover:brightness-100";

  // `md` is the only size the design system defines — Figma's Button (609:785)
  // has a single size at 24px horizontal / 16px vertical padding.
  // `leading-[normal]` matches Figma's automatic line height, which comes from
  // the font's own metrics (~19px for Inter at 16px). Tailwind's `text-base`
  // would impose 24px instead, making the button 56px tall against the designed
  // 51px — so padding alone does not reconcile it. `sm` and `lg` have no
  // counterpart in the design and are left as-is.
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-4 text-base leading-[normal]",
    lg: "px-8 py-4 text-lg",
  };

  const variantColorStyles = {
    solid: {
      primary:
        "bg-brand-default text-brand-on-brand hover:brightness-110 focus:ring-brand-default",
      secondary:
        "bg-aqua-default text-text-inverse hover:brightness-110 focus:ring-aqua-default",
      // Figma's Button `Type=Secondary`: bg `button/secondary/bg-color` #ffffff,
      // label `button/secondary/text-color` #45474d — which is
      // `on-surface-variant`, not `on-surface` (#1b1c19).
      white:
        "bg-background-default text-text-default hover:bg-background-warm focus:ring-outline",
      dark: "bg-ink-strong text-background-default hover:brightness-125 focus:ring-ink-strong",
      // The destructive action — Delete Account and its modal's confirm
      // (Figma 1988:12282, 2060:7053). A role, not a state, which is why it
      // lives here and `brand-muted` does not: it says "this button destroys
      // something" wherever it appears. See the note on `--color-danger` in
      // @pbh/tokens for why it is neither `error` nor `accent-pink`.
      danger: "bg-danger text-text-inverse hover:brightness-110 focus:ring-danger",
    },
    outline: {
      primary:
        "border-2 border-brand-default text-brand-default hover:bg-brand-default/5 focus:ring-brand-default",
      secondary:
        "border-2 border-aqua-default text-aqua-default hover:bg-aqua-default/5 focus:ring-aqua-default",
      white:
        "border-2 border-border-inverse text-text-inverse hover:bg-text-inverse/10 focus:ring-border-inverse",
      dark: "border-2 border-ink-strong text-ink-strong hover:bg-ink-strong/5 focus:ring-ink-strong",
      danger:
        "border-2 border-danger text-danger hover:bg-danger/5 focus:ring-danger",
    },
    ghost: {
      primary: "text-brand-default hover:bg-brand-default/5 focus:ring-brand-default",
      secondary: "text-aqua-default hover:bg-aqua-default/5 focus:ring-aqua-default",
      white: "text-text-inverse hover:bg-text-inverse/10 focus:ring-border-inverse",
      dark: "text-ink-strong hover:bg-ink-strong/5 focus:ring-ink-strong",
      danger: "text-danger hover:bg-danger/5 focus:ring-danger",
    },
  };

  const styles = cn(
    baseStyles,
    sizeStyles[size],
    variantColorStyles[variant][color],
    disabled && disabledStyles,
    className
  );

  // A disabled link is meaningless, so render a real <button disabled> even
  // when an href is supplied.
  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={styles}
        data-tina-field={tinaField}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={styles}
      data-tina-field={tinaField}
      {...rest}
    >
      {children}
    </button>
  );
}
