"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GenerativeSkeletonMeshProps {
  /** Number of skeleton lines to render */
  lines?: number;
  /** Outer width — pass any tailwind class or inline style */
  className?: string;
  /** Height override (px). Defaults to lines * 28 + 96 */
  height?: number;
  /** Animation speed multiplier (1 = default). Higher = faster. */
  speed?: number;
}

const GENERATIVE_MATTE_NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.65 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

/**
 * GenerativeSkeletonMesh
 *
 * A flowing aurora "AI is thinking" loader. Three layers do the work:
 *   1. Two large radial-gradient blobs counter-translating (transform only)
 *   2. A conic-gradient halo slowly rotating behind the lines
 *   3. Skeleton bars with a left→right shimmer band (translateX)
 *
 * Every animation runs on transform/opacity. Theme-aware via CSS vars.
 */
export function GenerativeSkeletonMesh({
  lines = 4,
  className,
  height,
  speed = 1,
}: GenerativeSkeletonMeshProps) {
  const computedHeight = height ?? lines * 28 + 96;
  const dur = 5.5 / speed;

  return (
    <div
      role="status"
      aria-label="Generating response"
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl border border-black/[0.08]",
        "bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)]",
        "[box-shadow:0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.08)]",
        "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)]",
        "dark:[box-shadow:0_1px_2px_rgba(0,0,0,.4),0_8px_24px_-12px_rgba(0,0,0,.6)]",
        className
      )}
      style={{ height: computedHeight }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.055]"
        style={{
          backgroundImage: GENERATIVE_MATTE_NOISE,
          backgroundSize: "240px 240px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.035)_0%,transparent_30%,transparent_72%,rgba(0,0,0,0.055)_100%)] dark:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12)_0%,transparent_28%,transparent_72%,rgba(0,0,0,0.22)_100%)]"
      />

      {/* Soft conic halo — warm amber breath threaded through cool whites
          and a dash of sky. Premium "AI thinking" loaders (Anthropic
          Claude's coral, GitHub Copilot's neutral shimmer) lean WARM,
          never red — red AI thinking reads as "the AI is broken". */}
      <div
        aria-hidden
        className="absolute -inset-[30%] opacity-70 dark:opacity-50"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.10), rgba(56,189,248,0.14), rgba(255,255,255,0.04), rgba(245,158,11,0.18), rgba(255,255,255,0.06), rgba(255,255,255,0.10))",
          filter: "blur(40px)",
          animation: `wensity-mesh-spin ${dur * 3}s linear infinite`,
          willChange: "transform",
        }}
      />

      {/* Mesh blob A — neutral drift (white + cool sky tone) */}
      <div
        aria-hidden
        className="absolute -inset-[30%]"
        style={{
          background:
            "radial-gradient(36% 50% at 30% 40%, rgba(255,255,255,0.20), transparent 65%), radial-gradient(40% 50% at 70% 70%, rgba(56,189,248,0.22), transparent 65%)",
          filter: "blur(34px)",
          animation: `wensity-mesh-driftA ${dur}s ease-in-out infinite alternate`,
          willChange: "transform",
        }}
      />

      {/* Mesh blob B — counter drift with a warm amber accent (the
          "AI processing warmth" signature). */}
      <div
        aria-hidden
        className="absolute -inset-[30%]"
        style={{
          background:
            "radial-gradient(36% 50% at 75% 30%, rgba(255,255,255,0.18), transparent 65%), radial-gradient(40% 60% at 25% 85%, rgba(245,158,11,0.28), transparent 65%)",
          filter: "blur(40px)",
          animation: `wensity-mesh-driftB ${dur * 1.35}s ease-in-out infinite alternate`,
          willChange: "transform",
        }}
      />

      {/* Faux content rows with a sweeping highlight band — neutral white
          shimmer (matches GitHub Copilot, Linear AI). The brand colour does
          not need to appear in every row; it would only add noise. */}
      <div className="relative flex h-full flex-col justify-center gap-3.5 px-6">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="relative h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]"
            style={{ width: `${[100, 92, 78, 88, 64, 96][i % 6]}%` }}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[40%] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                animation: `wensity-mesh-sweep ${1.6 + i * 0.18}s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.16}s infinite`,
                willChange: "transform",
              }}
            />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>

      <style>{`
        @keyframes wensity-mesh-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes wensity-mesh-driftA {
          0%   { transform: translate3d(-12%, -8%, 0) scale(1); }
          100% { transform: translate3d(14%, 10%, 0) scale(1.15); }
        }
        @keyframes wensity-mesh-driftB {
          0%   { transform: translate3d(14%, 10%, 0) scale(1.1); }
          100% { transform: translate3d(-14%, -8%, 0) scale(0.95); }
        }
        @keyframes wensity-mesh-sweep {
          0%   { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(360%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
