"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
  DEFAULT_HERO_IMAGE,
} from "./hero-utils";

// Neural data nodes: position, palette color, animation timing
const NODES = [
  { x:  92, y: 185, color: "#c6c2bc", dur: 3.2, delay: 0.0 },
  { x: 218, y: 415, color: "#aacebe", dur: 2.8, delay: 0.6 },
  { x: 390, y: 142, color: "#c6c2bc", dur: 3.6, delay: 1.2 },
  { x: 462, y: 495, color: "#c6c2bc", dur: 2.6, delay: 0.3 },
  { x: 572, y: 292, color: "#b7c7eb", dur: 3.0, delay: 0.9 },
  { x: 695, y: 162, color: "#c6c2bc", dur: 3.3, delay: 1.5 },
  { x: 758, y: 535, color: "#aacebe", dur: 2.9, delay: 0.4 },
  { x: 882, y: 268, color: "#c6c2bc", dur: 3.1, delay: 1.1 },
  { x: 968, y: 458, color: "#b7c7eb", dur: 2.7, delay: 0.7 },
  { x: 1058, y: 172, color: "#c6c2bc", dur: 3.4, delay: 1.8 },
  { x: 1128, y: 398, color: "#aacebe", dur: 2.5, delay: 0.2 },
  { x:  312, y: 658, color: "#c6c2bc", dur: 3.6, delay: 1.3 },
];

// Connection edges: [nodeIndexA, nodeIndexB, flowDuration]
const EDGES: [number, number, number][] = [
  [0,  1,  4.0], [1,  3,  3.5], [2,  4,  4.2], [3,  4,  3.8],
  [4,  5,  4.5], [4,  6,  3.2], [5,  7,  4.1], [6,  8,  3.7],
  [7,  9,  4.8], [8, 10,  3.9], [7,  8,  4.3], [1, 11,  5.0],
];

export function HeroNeuralSplit({
  variant = "split",
  headline,
  subheadline,
  image,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  const isReverse = variant === "splitReverse";

  return (
    <section className="relative overflow-hidden bg-surface px-6 md:px-12 lg:px-20 py-16 lg:py-20">

      {/* Brain-coral pattern — tiled at ~60% size, very subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/brain-p.svg')",
          backgroundSize: "62%",
          opacity: 0.055,
        }}
      />

      {/* Animated neural data overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <style>{`
            @keyframes nodeGray {
              0%, 100% { opacity: 0.12; }
              50%       { opacity: 0.32; }
            }
            @keyframes nodeColor {
              0%, 100% { opacity: 0; }
              40%, 60% { opacity: 0.75; }
            }
            @keyframes dataFlow {
              0%   { stroke-dashoffset: 60; opacity: 0.28; }
              100% { stroke-dashoffset: 0;  opacity: 0.05; }
            }
            @keyframes lineColor {
              0%   { stroke-dashoffset: 60; opacity: 0.5; }
              100% { stroke-dashoffset: 0;  opacity: 0.08; }
            }
          `}</style>
        </defs>

        {/* Connection lines with flowing dash animation */}
        {EDGES.map(([a, b, dur], i) => {
          const na = NODES[a], nb = NODES[b];
          const isColored = na.color !== "#c6c2bc" || nb.color !== "#c6c2bc";
          const stroke = isColored
            ? (na.color !== "#c6c2bc" ? na.color : nb.color)
            : "#c6c2bc";
          return (
            <line
              key={i}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={stroke}
              strokeWidth="0.75"
              strokeDasharray="5 11"
              style={{
                animation: `${isColored ? "lineColor" : "dataFlow"} ${dur}s linear infinite`,
                animationDelay: `${na.delay}s`,
              }}
            />
          );
        })}

        {/* Data nodes */}
        {NODES.map((n, i) => {
          const isColored = n.color !== "#c6c2bc";
          return (
            <circle
              key={i}
              cx={n.x} cy={n.y}
              r={isColored ? 3.5 : 2}
              fill={n.color}
              style={{
                animation: `${isColored ? "nodeColor" : "nodeGray"} ${n.dur}s ease-in-out infinite`,
                animationDelay: `${n.delay}s`,
              }}
            />
          );
        })}
      </svg>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

        {/* Text */}
        <div
          className={cn(
            "z-10 flex flex-col gap-10 lg:gap-16 flex-1",
            isReverse ? "order-2 lg:order-2" : "order-2 lg:order-1"
          )}
        >
          <div className="flex flex-col gap-6">
            <h1
              className="animate-fade-up text-4xl md:text-5xl lg:text-[56px] font-bold font-headline text-on-surface leading-[1.1] tracking-tight"
              style={{ animationDelay: "0ms" }}
              data-tina-field={tinaFields?.headline}
            >
              {headline
                ? highlightBrainHealth(headline, "text-secondary animate-brain-health-glow")
                : null}
            </h1>
            {subheadline && (
              <p
                className="animate-fade-up text-lg md:text-2xl text-on-surface leading-relaxed max-w-xl"
                style={{ animationDelay: "180ms" }}
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>

          {primaryButtonText && (
            <a
              href={primaryButtonLink || "#"}
              className="animate-fade-up bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-sm font-bold active:scale-90 transition-transform duration-200 inline-flex items-center justify-center w-fit"
              style={{ animationDelay: "320ms" }}
              data-tina-field={tinaFields?.primaryButtonText}
            >
              {primaryButtonText}
            </a>
          )}

          {/* Trust bar */}
          <div
            className="animate-fade-up border-l-4 border-outline-variant pl-6 flex flex-col gap-2"
            style={{ animationDelay: "460ms" }}
          >
            <TrustAvatars />
            <p className="text-lg font-medium text-on-surface">3,200+ Patients</p>
            <p className="text-base text-outline">Trust Us</p>
          </div>
        </div>

        {/* Image */}
        <div
          className={cn(
            "animate-fade-up relative w-full lg:w-[500px] xl:w-[600px] shrink-0",
            isReverse ? "order-1 lg:order-1" : "order-1 lg:order-2"
          )}
          style={{ animationDelay: "80ms" }}
        >
          {image ? (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden">
              <Image src={image} alt={headline || ""} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden bg-surface-container-high">
              <img
                src={DEFAULT_HERO_IMAGE}
                alt="Couple enjoying cognitive wellness"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
