"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MorphingShapeBlob {
  /** Tailwind/CSS color or gradient string for `background`. */
  color: string;
  /** 0..1 — relative size vs the container's smallest side. */
  size?: number;
  /** Initial top/left as % of the container. */
  top?: number;
  left?: number;
  /** Blur radius in px. */
  blur?: number;
  /** Opacity 0..1. */
  opacity?: number;
  /** Seconds for one morph + rotate cycle. */
  duration?: number;
  /** Start delay in seconds (negative = pre-rolled). */
  delay?: number;
  /** Rotation direction. */
  reverse?: boolean;
}

export interface MorphingShapeBackgroundProps {
  blobs?: MorphingShapeBlob[];
  /** Add the inline grain overlay on top (kills color banding). */
  grain?: boolean;
  /** Optional foreground content rendered above the blobs + grain. */
  children?: React.ReactNode;
  className?: string;
}

// Premium aurora palette: brand chili anchored at one corner, with
// cool/warm complementary tones for visual interest. Copies the Linear
// "subtle multi-hue" aurora feeling rather than a monochrome red wash.
const DEFAULT_BLOBS: MorphingShapeBlob[] = [
  {
    color: "linear-gradient(135deg, #cd1c18 0%, #ff8a73 100%)",
    size: 0.85,
    top: 10,
    left: 8,
    blur: 80,
    opacity: 0.45,
    duration: 28,
  },
  {
    // Deep sky — calm, cool counterweight to the brand chili.
    color: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)",
    size: 0.7,
    top: 35,
    left: 55,
    blur: 90,
    opacity: 0.42,
    duration: 36,
    reverse: true,
    delay: -8,
  },
  {
    // Warm amber — keeps the warm/cool tension premium products use.
    color: "linear-gradient(135deg, #f59e0b 0%, #fde68a 100%)",
    size: 0.55,
    top: 60,
    left: 20,
    blur: 70,
    opacity: 0.32,
    duration: 32,
    delay: -14,
  },
  {
    // Emerald — prevents the composition from leaning red+orange-only.
    color: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    size: 0.45,
    top: 5,
    left: 65,
    blur: 60,
    opacity: 0.38,
    duration: 24,
    reverse: true,
    delay: -4,
  },
];

const GRAIN_DATA_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * MorphingShapeBackground
 *
 * Slow, lava-lamp blobs built with CSS `border-radius` + `transform: rotate`
 * keyframes. No SVG path morphing → 120fps trivially. A grain overlay sits
 * above the blobs to kill color banding and add a tactile matte texture.
 *
 * GPU contract: animates only `transform` (rotate) + `border-radius`. Border
 * radius is not GPU-composited but it's almost free at this scale because
 * the blob is just a div with a single solid background.
 */
export function MorphingShapeBackground({
  blobs = DEFAULT_BLOBS,
  grain = true,
  children,
  className,
}: MorphingShapeBackgroundProps) {
  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden",
        className
      )}
    >
      {/* Blob layer */}
      <div className="absolute inset-0 -z-10">
        {blobs.map((b, i) => (
          <Blob key={i} index={i} blob={b} />
        ))}
      </div>

      {/* Grain — eliminates banding, adds matte-glass feel */}
      {grain && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_DATA_URL }}
        />
      )}

      {/* Foreground */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

function Blob({ index, blob }: { index: number; blob: MorphingShapeBlob }) {
  const size = blob.size ?? 0.7;
  const top = blob.top ?? 20;
  const left = blob.left ?? 20;
  const duration = blob.duration ?? 30;
  const delay = blob.delay ?? 0;
  const opacity = blob.opacity ?? 0.5;
  const blur = blob.blur ?? 80;
  const reverse = !!blob.reverse;

  // Each blob gets its own keyframe pair (radius morph + rotation) so they
  // never sync up. Names are unique per index.
  const morphName = `wensity-morph-${index}`;
  const rotName = `wensity-morph-rot-${reverse ? "ccw" : "cw"}`;

  return (
    <>
      <style>{`
        @keyframes ${morphName} {
          0%   { border-radius: 42% 58% 70% 30% / 38% 52% 48% 62%; }
          25%  { border-radius: 58% 42% 36% 64% / 62% 30% 70% 38%; }
          50%  { border-radius: 32% 68% 56% 44% / 50% 64% 36% 50%; }
          75%  { border-radius: 64% 36% 50% 50% / 44% 56% 44% 56%; }
          100% { border-radius: 42% 58% 70% 30% / 38% 52% 48% 62%; }
        }
      `}</style>
      <div
        aria-hidden
        className="absolute motion-reduce:![animation:none]"
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: `${size * 80}%`,
          aspectRatio: "1 / 1",
          background: blob.color,
          opacity,
          filter: `blur(${blur}px)`,
          willChange: "transform, border-radius",
          animation: `${morphName} ${duration}s ease-in-out ${delay}s infinite, ${rotName} ${
            duration * 1.5
          }s linear ${delay}s infinite`,
          transformOrigin: "50% 50%",
        }}
      />
    </>
  );
}
