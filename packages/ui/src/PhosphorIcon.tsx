"use client";

import * as PhosphorIcons from "@phosphor-icons/react";
import type { ComponentType, SVGAttributes } from "react";

type IconProps = SVGAttributes<SVGElement> & {
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  mirrored?: boolean;
};

interface PhosphorIconProps extends IconProps {
  name?: string;
}

export function PhosphorIcon({ name, ...props }: PhosphorIconProps) {
  if (!name) return null;
  const Icon = (PhosphorIcons as unknown as Record<string, ComponentType<IconProps>>)[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
