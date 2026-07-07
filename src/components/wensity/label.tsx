"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelVariant =
  | "default"
  | "required"
  | "optional"
  | "muted"
  | "inline";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: LabelVariant;
  /** Secondary copy shown beside the label text — most useful with `inline`. */
  hint?: React.ReactNode;
  disabled?: boolean;
}

const base = "text-[13px] leading-none tracking-[-0.01em]";

const variantClasses: Record<LabelVariant, string> = {
  default: cn(base, "mb-2 block font-medium text-[var(--foreground)]"),
  required: cn(base, "mb-2 block font-medium text-[var(--foreground)]"),
  optional: cn(base, "mb-2 block font-medium text-[var(--foreground)]"),
  muted: cn(
    base,
    "block text-[12px] font-normal leading-[1.4] text-[var(--muted-foreground)]",
  ),
  inline: cn(
    base,
    "inline-flex min-w-[7.5rem] items-center gap-2 font-medium text-[var(--foreground)]",
  ),
};

function RequiredMarker() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 font-medium text-red-600 dark:text-red-400"
    >
      *
    </span>
  );
}

function OptionalMarker() {
  return (
    <span className="ml-2 text-[11px] font-medium text-[var(--muted-foreground)]">
      Optional
    </span>
  );
}

export const labelVariants = variantClasses;

export function Label({
  variant = "default",
  hint,
  disabled = false,
  className,
  children,
  ...props
}: LabelProps) {
  const showRequired = variant === "required";
  const showOptional = variant === "optional";
  const isInline = variant === "inline";

  return (
    <label
      data-slot="label"
      data-variant={variant}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
      {...props}
    >
      <span className={cn(isInline && "inline-flex items-center gap-2")}>
        <span>{children}</span>
        {showRequired ? <RequiredMarker /> : null}
        {showOptional ? <OptionalMarker /> : null}
        {hint ? (
          <span
            className={cn(
              "font-normal text-[var(--muted-foreground)]",
              isInline ? "text-[12px]" : "mt-1 block text-[12px] leading-[1.45]",
            )}
          >
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}
