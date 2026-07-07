"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "default" | "gradient" | "dashed";
export type SeparatorLabelPosition = "start" | "center" | "end";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
  label?: React.ReactNode;
  labelPosition?: SeparatorLabelPosition;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "default",
      label,
      labelPosition = "center",
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";

    // Style builders for line elements
    const getLineStyles = (isFirst: boolean) => {
      return cn(
        isHorizontal ? "h-px w-full" : "w-px h-full self-stretch",
        // Default Solid Styling
        variant === "default" && "bg-zinc-200 dark:bg-zinc-800",
        // Gradient Styling
        variant === "gradient" && [
          isHorizontal
            ? isFirst
              ? "bg-gradient-to-r from-transparent via-zinc-300 to-zinc-300 dark:via-zinc-700 dark:to-zinc-700"
              : "bg-gradient-to-r from-zinc-300 via-zinc-300 to-transparent dark:from-zinc-700 dark:via-zinc-700 dark:to-transparent"
            : isFirst
            ? "bg-gradient-to-b from-transparent via-zinc-300 to-zinc-300 dark:via-zinc-700 dark:to-zinc-700"
            : "bg-gradient-to-b from-zinc-300 via-zinc-300 to-transparent dark:from-zinc-700 dark:via-zinc-700 dark:to-transparent",
        ],
        // Dashed Styling (Uses border rather than background fill)
        variant === "dashed" && [
          isHorizontal
            ? "border-t border-dashed border-zinc-300 dark:border-zinc-800"
            : "border-l border-dashed border-zinc-300 dark:border-zinc-800",
        ]
      );
    };

    // If no label, render a single straight line
    if (!label) {
      return (
        <div
          ref={ref}
          role="none"
          className={cn(
            isHorizontal ? "h-px w-full" : "w-px h-full self-stretch",
            // Single line background config
            variant === "default" && "bg-zinc-200 dark:bg-zinc-800",
            variant === "gradient" && [
              isHorizontal
                ? "bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700"
                : "bg-gradient-to-b from-transparent via-zinc-300 to-transparent dark:via-zinc-700",
            ],
            variant === "dashed" && [
              isHorizontal
                ? "border-t border-dashed border-zinc-300 dark:border-zinc-800"
                : "border-l border-dashed border-zinc-300 dark:border-zinc-800",
            ],
            className
          )}
          {...props}
        />
      );
    }

    // Label position alignment sizes for the surrounding lines
    const line1Flex =
      labelPosition === "start"
        ? isHorizontal
          ? "w-8 shrink-0"
          : "h-8 shrink-0"
        : "flex-1";
    const line2Flex =
      labelPosition === "end"
        ? isHorizontal
          ? "w-8 shrink-0"
          : "h-8 shrink-0"
        : "flex-1";

    return (
      <div
        ref={ref}
        role="none"
        className={cn(
          "flex items-center text-zinc-400 dark:text-zinc-500 select-none",
          isHorizontal
            ? "flex-row w-full gap-3 text-[11px] font-semibold tracking-wider"
            : "flex-col h-full gap-3 py-1 text-[10px] font-semibold tracking-wider",
          className
        )}
        {...props}
      >
        <div className={cn(getLineStyles(true), line1Flex)} />
        <span className="shrink-0 font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
          {label}
        </span>
        <div className={cn(getLineStyles(false), line2Flex)} />
      </div>
    );
  }
);
Separator.displayName = "Separator";
