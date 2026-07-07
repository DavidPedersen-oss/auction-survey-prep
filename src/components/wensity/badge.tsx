"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "carbon"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeRadius = "sm" | "md" | "pill";

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  radius?: BadgeRadius;
  asChild?: boolean;
  interactive?: boolean;
  dot?: boolean;
  pulseDot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}

const base = cn(
  "group/badge relative inline-flex max-w-full shrink-0 items-center justify-center overflow-hidden",
  "border font-medium leading-none tracking-[-0.005em] select-none",
  "transition-[background,border-color,color,box-shadow,opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_18%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

const interactiveClasses = cn(
  "cursor-default",
  "active:duration-100",
);

const sizes: Record<BadgeSize, string> = {
  sm: "h-6 gap-1.5 px-2.5 text-[11px] [&_svg]:size-3",
  md: "h-7 gap-1.5 px-3 text-xs [&_svg]:size-3.5",
  lg: "h-8 gap-2 px-3.5 text-[13px] [&_svg]:size-4",
};

const radii: Record<BadgeRadius, string> = {
  sm: "rounded-md",
  md: "rounded-lg",
  pill: "rounded-full",
};

const variants: Record<BadgeVariant, string> = {
  neutral: cn(
    "border-[color-mix(in_srgb,var(--foreground)_13%,transparent)] text-[var(--foreground)]",
    "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_8%,var(--background))_0%,color-mix(in_srgb,var(--foreground)_4%,var(--background))_48%,color-mix(in_srgb,var(--foreground)_6%,var(--background))_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.56),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.05),0_10px_24px_-16px_rgba(0,0,0,0.34)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.07),0_12px_28px_-16px_rgba(0,0,0,0.44)]",
    "dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_10%,var(--background))_0%,color-mix(in_srgb,var(--foreground)_5%,var(--background))_52%,color-mix(in_srgb,var(--foreground)_8%,var(--background))_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.34),0_12px_28px_-16px_rgba(0,0,0,0.80)]",
  ),
  success: cn(
    "border-emerald-500/32 text-emerald-800",
    "bg-[linear-gradient(180deg,rgba(236,253,245,0.95)_0%,rgba(209,250,229,0.70)_47%,rgba(167,243,208,0.42)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_-1px_0_rgba(6,95,70,0.08),0_1px_2px_rgba(6,95,70,0.10),0_10px_24px_-15px_rgba(16,185,129,0.62)]",
    "hover:border-emerald-500/48 hover:text-emerald-900 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(6,95,70,0.10),0_1px_2px_rgba(6,95,70,0.12),0_13px_30px_-15px_rgba(16,185,129,0.72)]",
    "dark:text-emerald-200 dark:hover:text-emerald-100 dark:border-emerald-300/26 dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.58)_0%,rgba(6,95,70,0.28)_52%,rgba(16,185,129,0.12)_100%)]",
  ),
  warning: cn(
    "border-amber-500/38 text-amber-900",
    "bg-[linear-gradient(180deg,rgba(255,251,235,0.96)_0%,rgba(254,243,199,0.75)_46%,rgba(252,211,77,0.30)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.74),inset_0_-1px_0_rgba(146,64,14,0.08),0_1px_2px_rgba(146,64,14,0.10),0_10px_24px_-15px_rgba(245,158,11,0.64)]",
    "hover:border-amber-500/52 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.80),inset_0_-1px_0_rgba(146,64,14,0.10),0_1px_2px_rgba(146,64,14,0.12),0_13px_30px_-15px_rgba(245,158,11,0.74)]",
    "dark:text-amber-200 dark:hover:text-amber-100 dark:border-amber-200/28 dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.58)_0%,rgba(146,64,14,0.30)_52%,rgba(245,158,11,0.12)_100%)]",
  ),
  danger: cn(
    "border-red-500/36 text-red-800",
    "bg-[linear-gradient(180deg,rgba(254,242,242,0.96)_0%,rgba(254,226,226,0.72)_48%,rgba(252,165,165,0.30)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_-1px_0_rgba(153,27,27,0.08),0_1px_2px_rgba(153,27,27,0.10),0_10px_24px_-15px_rgba(239,68,68,0.64)]",
    "hover:border-red-500/52 hover:text-red-900 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(153,27,27,0.10),0_1px_2px_rgba(153,27,27,0.12),0_13px_30px_-15px_rgba(239,68,68,0.74)]",
    "dark:text-red-200 dark:hover:text-red-100 dark:border-red-300/28 dark:bg-[linear-gradient(180deg,rgba(127,29,29,0.60)_0%,rgba(153,27,27,0.30)_52%,rgba(239,68,68,0.13)_100%)]",
  ),
  info: cn(
    "border-sky-500/34 text-sky-800",
    "bg-[linear-gradient(180deg,rgba(240,249,255,0.96)_0%,rgba(224,242,254,0.72)_48%,rgba(125,211,252,0.30)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_-1px_0_rgba(3,105,161,0.08),0_1px_2px_rgba(3,105,161,0.10),0_10px_24px_-15px_rgba(14,165,233,0.62)]",
    "hover:border-sky-500/50 hover:text-sky-900 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(3,105,161,0.10),0_1px_2px_rgba(3,105,161,0.12),0_13px_30px_-15px_rgba(14,165,233,0.72)]",
    "dark:text-sky-200 dark:hover:text-sky-100 dark:border-sky-300/28 dark:bg-[linear-gradient(180deg,rgba(12,74,110,0.60)_0%,rgba(3,105,161,0.30)_52%,rgba(14,165,233,0.13)_100%)]",
  ),
  brand: cn(
    "border-rose-500/36 text-rose-800",
    "bg-[linear-gradient(180deg,rgba(255,241,242,0.96)_0%,rgba(255,228,230,0.72)_48%,rgba(253,164,175,0.32)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.70),inset_0_-1px_0_rgba(159,18,57,0.08),0_1px_2px_rgba(159,18,57,0.10),0_10px_24px_-15px_rgba(244,63,94,0.66)]",
    "hover:border-rose-500/52 hover:text-rose-900 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(159,18,57,0.10),0_1px_2px_rgba(159,18,57,0.12),0_13px_30px_-15px_rgba(244,63,94,0.76)]",
    "dark:text-rose-200 dark:hover:text-rose-100 dark:border-rose-300/28 dark:bg-[linear-gradient(180deg,rgba(136,19,55,0.60)_0%,rgba(159,18,57,0.30)_52%,rgba(244,63,94,0.14)_100%)]",
  ),
  carbon: cn(
    "border-neutral-950/90 text-white",
    "bg-[linear-gradient(180deg,#2d2d31_0%,#111113_46%,#050506_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.70),0_1px_2px_rgba(0,0,0,0.22),0_12px_28px_-16px_rgba(0,0,0,0.85)]",
    "hover:border-neutral-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.78),0_1px_2px_rgba(0,0,0,0.28),0_14px_32px_-16px_rgba(0,0,0,0.92)]",
    "dark:border-white/14 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.075)_46%,rgba(255,255,255,0.045)_100%)] dark:text-white dark:hover:border-white/22",
  ),
  outline: cn(
    "border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] text-[var(--foreground)]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_48%,rgba(0,0,0,0.015)_100%)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.46),inset_0_-1px_0_rgba(0,0,0,0.035),0_1px_2px_rgba(0,0,0,0.04)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_28%,transparent)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.11)_48%,rgba(0,0,0,0.02)_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-16px_rgba(0,0,0,0.36)]",
    "dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.035)_52%,rgba(255,255,255,0.015)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.42),0_1px_2px_rgba(0,0,0,0.26)]",
  ),
};

const surfaceLayers: Record<BadgeVariant, string> = {
  neutral:
    "bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.28)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_44%,transparent_58%)]",
  success:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.85),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(16,185,129,0.30),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.36)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(52,211,153,0.22),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  warning:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.86),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(245,158,11,0.32),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.38)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(251,191,36,0.22),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  danger:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.84),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(239,68,68,0.30),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.34)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.15),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(248,113,113,0.22),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  info:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.84),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(14,165,233,0.30),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.34)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.15),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(56,189,248,0.22),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  brand:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.84),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(244,63,94,0.32),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.34)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.15),transparent_34%),radial-gradient(circle_at_85%_100%,rgba(251,113,133,0.24),transparent_45%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  carbon:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.20),transparent_36%),radial-gradient(circle_at_80%_100%,rgba(255,255,255,0.08),transparent_42%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_44%,transparent_58%)]",
  outline:
    "bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.58),transparent_34%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.22)_44%,transparent_58%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.10),transparent_34%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_44%,transparent_58%)]",
};

const textureLayers: Record<BadgeVariant, string> = {
  neutral:
    "bg-[linear-gradient(135deg,rgba(0,0,0,0.035)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.055)_0_1px,transparent_1px_5px)]",
  success:
    "bg-[linear-gradient(135deg,rgba(5,150,105,0.12)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(110,231,183,0.10)_0_1px,transparent_1px_5px)]",
  warning:
    "bg-[linear-gradient(135deg,rgba(217,119,6,0.13)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(252,211,77,0.10)_0_1px,transparent_1px_5px)]",
  danger:
    "bg-[linear-gradient(135deg,rgba(220,38,38,0.12)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(252,165,165,0.10)_0_1px,transparent_1px_5px)]",
  info:
    "bg-[linear-gradient(135deg,rgba(2,132,199,0.12)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(125,211,252,0.10)_0_1px,transparent_1px_5px)]",
  brand:
    "bg-[linear-gradient(135deg,rgba(225,29,72,0.12)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(253,164,175,0.10)_0_1px,transparent_1px_5px)]",
  carbon:
    "bg-[linear-gradient(135deg,rgba(255,255,255,0.075)_0_1px,transparent_1px_5px)]",
  outline:
    "bg-[linear-gradient(135deg,rgba(0,0,0,0.035)_0_1px,transparent_1px_5px)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_5px)]",
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--muted-foreground)]",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-300",
  danger: "bg-red-500 dark:bg-red-400",
  info: "bg-sky-500 dark:bg-sky-400",
  brand: "bg-rose-500 dark:bg-rose-400",
  carbon: "bg-white/85 dark:bg-white",
  outline: "bg-[var(--foreground)]",
};

const closeSizes: Record<BadgeSize, string> = {
  sm: "-mr-1 size-4",
  md: "-mr-1 size-4.5",
  lg: "-mr-1.5 size-5",
};

export function badgeVariants({
  variant = "neutral",
  size = "md",
  radius = "pill",
  interactive = false,
  className,
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
  radius?: BadgeRadius;
  interactive?: boolean;
  className?: string;
} = {}) {
  return cn(
    base,
    variants[variant],
    sizes[size],
    radii[radius],
    interactive && interactiveClasses,
    className,
  );
}

export const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  (
    {
      className,
      variant = "neutral",
      size = "md",
      radius = "pill",
      asChild = false,
      interactive = false,
      dot = false,
      pulseDot = false,
      leftIcon,
      rightIcon,
      onRemove,
      removeLabel = "Remove",
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "span";
    const isInteractive = interactive || Boolean(onRemove);

    return (
      <Comp
        ref={ref}
        className={badgeVariants({
          variant,
          size,
          radius,
          interactive: isInteractive,
          className,
        })}
        data-slot="badge"
        data-variant={variant}
        {...props}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.30)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-80 transition-opacity duration-200 group-hover/badge:opacity-100",
            surfaceLayers[variant],
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-[0.38] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-screen",
            textureLayers[variant],
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1.5 top-px z-0 h-px rounded-full bg-white/80 opacity-70 dark:bg-white/20 dark:opacity-55"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-1/2 top-0 z-0 h-full w-1/2 -skew-x-12 bg-white/30 opacity-0 blur-[1px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/badge:translate-x-[320%] group-hover/badge:opacity-35 dark:bg-white/16 dark:group-hover/badge:opacity-25"
        />
        {dot ? (
          <span className="relative z-10 inline-flex size-2 shrink-0 items-center justify-center">
            {pulseDot ? (
              <span
                className={cn(
                  "absolute inline-flex size-2 rounded-full opacity-40 motion-safe:animate-ping",
                  dotColors[variant],
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative size-1.5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.38)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.24)]",
                dotColors[variant],
              )}
            />
          </span>
        ) : null}
        {leftIcon ? <span className="relative z-10 inline-flex">{leftIcon}</span> : null}
        <span className="relative z-10 min-w-0 truncate">{children}</span>
        {rightIcon ? (
          <span className="relative z-10 inline-flex opacity-75 transition-opacity group-hover/badge:opacity-100">
            {rightIcon}
          </span>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            aria-label={removeLabel}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            className={cn(
              "relative z-10 inline-flex shrink-0 items-center justify-center rounded-full text-current/62",
              "transition-[background-color,color,transform] duration-150 ease-out",
              "hover:bg-current/[0.10] hover:text-current active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/20",
              closeSizes[size],
            )}
          >
            <IconX stroke={2} />
          </button>
        ) : null}
      </Comp>
    );
  },
);

Badge.displayName = "Badge";
