"use client";

import { HeroProps } from "./hero-utils";
import { HeroSplit } from "./HeroSplit";
import { HeroFullImage } from "./HeroFullImage";
import { HeroBrainMask } from "./HeroBrainMask";
import { HeroCentered } from "./HeroCentered";
import { HeroNeuralSplit } from "./HeroNeuralSplit";

export type { HeroProps };

export function Hero(props: HeroProps) {
  switch (props.variant) {
    case "split":
    case "splitReverse":
      return <HeroSplit {...props} />;
    case "fullImage":
      return <HeroFullImage {...props} />;
    case "brainMask":
      return <HeroBrainMask {...props} />;
    case "neuralSplit":
      return <HeroNeuralSplit {...props} />;
    default:
      return <HeroCentered {...props} />;
  }
}
