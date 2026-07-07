"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconChevronRight,
} from "@tabler/icons-react";

/* ─── Card Core Component ───────────────────────────────────── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl border",
          // Light mode defaults
          "border-zinc-200/80 bg-white text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          // Dark mode defaults
          "dark:border-white/[0.06] dark:bg-[#0c0c0e] dark:text-zinc-50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-12px_rgba(0,0,0,0.6)]",
          // Interactive styles (No press scale/lift, just border/bg hover)
          interactive && [
            "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
            "hover:border-zinc-300 hover:bg-zinc-50/50",
            "dark:hover:border-white/[0.12] dark:hover:bg-white/[0.01] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_12px_32px_-12px_rgba(0,0,0,0.8)]",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

/* ─── Card Structure Subcomponents ────────────────────────── */

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold text-base leading-none tracking-tight text-zinc-900 dark:text-zinc-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-zinc-500 dark:text-zinc-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ─── Card Media Wrapper ────────────────────────────────────── */

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  hoverZoom?: boolean;
}

const aspectRatioClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  auto: "h-auto",
};

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, aspectRatio = "video", hoverZoom = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 w-full",
          aspectRatioClasses[aspectRatio],
          hoverZoom &&
            "motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:[&>div]:scale-[1.04]",
          className
        )}
        {...props}
      >
        {/* We find child media items (like img/video) and wrap them or style them */}
        <div
          className={cn(
            "w-full h-full [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover",
            hoverZoom &&
              "transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
CardMedia.displayName = "CardMedia";

/* ─── Card Stat Details & Sparkline ─────────────────────────── */

export interface CardStatTrendProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  trend: "up" | "down" | "flat";
}

export const CardStatTrend = React.forwardRef<HTMLDivElement, CardStatTrendProps>(
  ({ className, value, trend, ...props }, ref) => {
    const trendConfig = {
      up: {
        icon: <IconArrowUpRight className="size-3.5 shrink-0" stroke={2} />,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20",
      },
      down: {
        icon: <IconArrowDownRight className="size-3.5 shrink-0" stroke={2} />,
        color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
      },
      flat: {
        icon: <IconMinus className="size-3.5 shrink-0" stroke={2} />,
        color: "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-500/10 border-zinc-200/50 dark:border-zinc-500/20",
      },
    };

    const current = trendConfig[trend];

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold tracking-tight",
          current.color,
          className
        )}
        {...props}
      >
        {current.icon}
        <span>{value}</span>
      </div>
    );
  }
);
CardStatTrend.displayName = "CardStatTrend";

export interface CardStatSparklineProps extends React.SVGProps<SVGSVGElement> {
  data: number[];
  trend?: "up" | "down" | "flat";
  width?: number;
  height?: number;
}

export function CardStatSparkline({
  data,
  trend = "up",
  width = 120,
  height = 40,
  className,
  ...props
}: CardStatSparklineProps) {
  const uniqueId = React.useId().replace(/:/g, "");

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3; // padding top/bottom
    return { x, y };
  });

  const pathD = points.reduce(
    (acc, point, i) =>
      i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`,
    ""
  );

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const colors = {
    up: {
      stroke: "#10b981", // emerald-500
      gradientStart: "rgba(16, 185, 129, 0.16)",
      gradientEnd: "rgba(16, 185, 129, 0.0)",
    },
    down: {
      stroke: "#ef4444", // red-500
      gradientStart: "rgba(239, 68, 68, 0.16)",
      gradientEnd: "rgba(239, 68, 68, 0.0)",
    },
    flat: {
      stroke: "#71717a", // zinc-500
      gradientStart: "rgba(113, 113, 122, 0.12)",
      gradientEnd: "rgba(113, 113, 122, 0.0)",
    },
  };

  const selectedColor = colors[trend];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      {...props}
    >
      <defs>
        <linearGradient id={`grad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={selectedColor.gradientStart} />
          <stop offset="100%" stopColor={selectedColor.gradientEnd} />
        </linearGradient>
      </defs>

      {/* Shadow/Glow under path */}
      <path d={fillD} fill={`url(#grad-${uniqueId})`} />

      {/* Animating Sparkline Path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={selectedColor.stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  );
}

/* ─── Card Feature Details ──────────────────────────────────── */

type CardFeatureActionLinkProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    label?: string;
  };

type CardFeatureActionStaticProps =
  React.HTMLAttributes<HTMLDivElement> & {
    href?: undefined;
    label?: string;
  };

export type CardFeatureActionProps =
  | CardFeatureActionLinkProps
  | CardFeatureActionStaticProps;

export const CardFeatureAction = React.forwardRef<
  HTMLAnchorElement | HTMLDivElement,
  CardFeatureActionProps
>(({ className, label = "Learn more", href, ...props }, ref) => {
  const content = (
    <>
      <span>{label}</span>
      <IconChevronRight
        className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        stroke={2.2}
      />
    </>
  );

  const actionClassName = cn(
    "inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100",
    "transition-colors duration-150 group-hover:text-[#cd1c18] dark:group-hover:text-red-400",
    className
  );

  if (href) {
    return (
      <a
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={actionClassName}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      className={actionClassName}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </div>
  );
});
CardFeatureAction.displayName = "CardFeatureAction";
