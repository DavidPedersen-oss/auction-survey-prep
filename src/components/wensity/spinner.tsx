"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SpinnerVariant = "default" | "ring" | "dots" | "pulse";
export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone = "neutral" | "brand" | "success" | "warning" | "danger";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
  showLabel?: boolean;
}

export interface SpinnerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  tone?: SpinnerTone;
  children?: React.ReactNode;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

const dotSizes: Record<SpinnerSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

const tones: Record<SpinnerTone, string> = {
  neutral: "text-[color-mix(in_srgb,var(--foreground)_76%,var(--background))]",
  brand: "text-rose-500 dark:text-rose-300",
  success: "text-emerald-500 dark:text-emerald-300",
  warning: "text-amber-500 dark:text-amber-300",
  danger: "text-red-500 dark:text-red-300",
};

const dotTones: Record<SpinnerTone, string> = {
  neutral: "bg-[color-mix(in_srgb,var(--foreground)_76%,var(--background))]",
  brand: "bg-rose-500 dark:bg-rose-300",
  success: "bg-emerald-500 dark:bg-emerald-300",
  warning: "bg-amber-500 dark:bg-amber-300",
  danger: "bg-red-500 dark:bg-red-300",
};

const ringLines = [
  "rotate-0",
  "rotate-[30deg]",
  "rotate-[60deg]",
  "rotate-90",
  "rotate-[120deg]",
  "rotate-[150deg]",
  "rotate-180",
  "rotate-[210deg]",
  "rotate-[240deg]",
  "rotate-[270deg]",
  "rotate-[300deg]",
  "rotate-[330deg]",
] as const;

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      tone = "neutral",
      label = "Loading",
      showLabel = false,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      ensureSpinnerStyles();
    }, []);

    return (
      <div
        ref={ref}
        role="status"
        aria-label={showLabel ? undefined : label}
        data-slot="spinner"
        data-variant={variant}
        className={cn("inline-flex items-center gap-2.5", tones[tone], className)}
        {...props}
      >
        {variant === "dots" ? (
          <span aria-hidden="true" className="inline-flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={cn("wensity-spinner-dot rounded-full", dotSizes[size], dotTones[tone])}
                style={{ animationDelay: `${index * 120}ms` }}
              />
            ))}
          </span>
        ) : variant === "pulse" ? (
          <span
            aria-hidden="true"
            className={cn(
              "wensity-spinner-pulse relative inline-flex rounded-full",
              sizeClasses[size],
              dotTones[tone],
            )}
          >
            <span className="wensity-spinner-pulse-ring absolute -inset-[5px] rounded-full border border-current" />
          </span>
        ) : variant === "ring" ? (
          <span
            aria-hidden="true"
            className={cn("wensity-spinner-lines relative inline-flex", sizeClasses[size])}
          >
            {ringLines.map((lineClassName, index) => (
              <span
                key={lineClassName}
                className={cn(
                  "wensity-spinner-line absolute left-1/2 top-0 -ml-px h-[28%] w-0.5 origin-[50%_178.5%] rounded-full bg-current",
                  lineClassName,
                )}
                style={{
                  animationDelay: `${index * -70}ms`,
                  opacity: 0.22 + index * 0.045,
                }}
              />
            ))}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-flex rounded-full border-2 border-[color-mix(in_srgb,currentColor_20%,transparent)] border-t-current",
              sizeClasses[size],
              variant === "default" && "wensity-spinner-default",
            )}
          />
        )}
        {showLabel ? (
          <span className="text-sm font-medium tracking-[-0.01em] text-[var(--foreground)]">
            {label}
          </span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  },
);
Spinner.displayName = "Spinner";

export const SpinnerOverlay = React.forwardRef<HTMLDivElement, SpinnerOverlayProps>(
  ({ className, label = "Loading", tone = "neutral", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="spinner-overlay"
        className={cn(
          "relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-2xl",
          "border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
          "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_4%,var(--background))_0%,var(--background)_100%)]",
          className,
        )}
        {...props}
      >
        {children ? (
          <div
            aria-hidden="true"
            inert
            className="pointer-events-none absolute inset-0 opacity-45 blur-[1px]"
          >
            {children}
          </div>
        ) : null}
        <div className="relative z-10 rounded-xl border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--background)] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_18px_38px_-24px_rgba(0,0,0,0.5)]">
          <Spinner variant="ring" tone={tone} label={label} showLabel />
        </div>
      </div>
    );
  },
);
SpinnerOverlay.displayName = "SpinnerOverlay";

function ensureSpinnerStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("wensity-spinner-styles")) return;

  const style = document.createElement("style");
  style.id = "wensity-spinner-styles";
  style.textContent = `
@media (prefers-reduced-motion: no-preference) {
  .wensity-spinner-default {
    animation: wensity-spinner-spin 680ms linear infinite;
  }

  .wensity-spinner-line {
    animation: wensity-spinner-line 840ms linear infinite;
  }

  .wensity-spinner-dot {
    animation: wensity-spinner-dot 900ms cubic-bezier(0.22, 1, 0.36, 1) infinite;
  }

  .wensity-spinner-pulse-ring {
    animation: wensity-spinner-pulse 1.15s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  }
}

@keyframes wensity-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes wensity-spinner-dot {
  0%, 80%, 100% {
    opacity: 0.38;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@keyframes wensity-spinner-line {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@keyframes wensity-spinner-pulse {
  from {
    opacity: 0.72;
    transform: scale(0.86);
  }
  to {
    opacity: 0;
    transform: scale(1.85);
  }
}
`;
  document.head.appendChild(style);
}
