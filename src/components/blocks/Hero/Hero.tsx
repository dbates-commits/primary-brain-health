"use client";

import { HeroProps } from "./hero-utils";
import { HeroFullImage } from "./HeroFullImage";

export type { HeroProps };

export function Hero(props: HeroProps) {
  return <HeroFullImage {...props} />;
}
