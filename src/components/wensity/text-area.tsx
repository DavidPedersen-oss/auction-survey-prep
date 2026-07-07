"use client";

import * as React from "react";
import { IconFileText } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaVariant = "default" | "filled" | "ghost";
export type TextareaResize = "none" | "vertical" | "both";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  textareaSize?: TextareaSize;
  variant?: TextareaVariant;
  resize?: TextareaResize;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  showCount?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
  textareaClassName?: string;
}

const textareaSizes: Record<TextareaSize, string> = {
  sm: "min-h-[5.5rem] rounded-xl px-4 py-3 text-xs leading-5",
  md: "min-h-[7.5rem] rounded-xl px-4 py-4 text-sm leading-6",
  lg: "min-h-[9.5rem] rounded-2xl px-5 py-4 text-[15px] leading-6",
};

const countPadding: Record<TextareaSize, string> = {
  sm: "pb-9",
  md: "pb-10",
  lg: "pb-11",
};

const resizeClasses: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  both: "resize",
};

const variantClasses: Record<TextareaVariant, string> = {
  default: cn(
    "border-[var(--border)] bg-[var(--background)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
  ),
  filled: cn(
    "border-[var(--border)]",
    "bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
  ),
  ghost: cn(
    "border-transparent bg-transparent",
    "hover:border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
    "hover:bg-[color-mix(in_srgb,var(--foreground)_2.5%,transparent)]",
  ),
};

const focusClasses = cn(
  "focus:border-[color-mix(in_srgb,var(--foreground)_24%,transparent)]",
);

const errorClasses = cn(
  "border-red-500/45",
  "hover:border-red-500/55",
  "focus:border-red-500/65",
);

const disabledClasses = cn(
  "cursor-not-allowed opacity-45",
  "hover:border-[var(--border)]",
);

const readOnlyClasses = cn(
  "border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_2.5%,var(--background))]",
  "text-[var(--muted-foreground)]",
  "hover:border-[var(--border)]",
);

function rowsToHeight(rows: number) {
  return `${Math.max(rows, 1) * 24 + 32}px`;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      className,
      containerClassName,
      textareaClassName,
      label,
      hint,
      error,
      textareaSize = "md",
      variant = "default",
      resize = "vertical",
      autoResize = false,
      minRows = textareaSize === "sm" ? 3 : textareaSize === "lg" ? 5 : 4,
      maxRows,
      showCount = false,
      fullWidth = true,
      disabled,
      readOnly,
      value,
      defaultValue,
      maxLength,
      onChange,
      "aria-describedby": ariaDescribedBy,
      style,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const textareaId = id ?? `wensity-textarea-${reactId}`;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const countId = showCount ? `${textareaId}-count` : undefined;
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue?.toString() ?? "",
    );
    const currentValue = isControlled ? value : uncontrolledValue;
    const currentLength = currentValue == null ? 0 : String(currentValue).length;
    const describedBy =
      [ariaDescribedBy, errorId, hintId, countId].filter(Boolean).join(" ") ||
      undefined;

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const syncHeight = React.useCallback(() => {
      const node = textareaRef.current;
      if (!node || !autoResize) return;

      node.style.height = "auto";
      const maxHeight = maxRows ? Number.parseFloat(rowsToHeight(maxRows)) : Infinity;
      node.style.height = `${Math.min(node.scrollHeight, maxHeight)}px`;
      node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [autoResize, maxRows]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) setUncontrolledValue(event.target.value);
        onChange?.(event);
        window.requestAnimationFrame(syncHeight);
      },
      [isControlled, onChange, syncHeight],
    );

    React.useLayoutEffect(() => {
      syncHeight();
    }, [currentValue, syncHeight]);

    return (
      <div
        className={cn(
          "flex flex-col gap-2.5",
          fullWidth ? "w-full" : "w-fit",
          containerClassName,
        )}
      >
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold leading-none tracking-[-0.01em] text-[var(--foreground)]"
          >
            {label}
          </label>
        ) : null}

        <div className={cn("relative", fullWidth ? "w-full" : "w-fit", className)}>
          <textarea
            ref={setRefs}
            id={textareaId}
            value={isControlled ? value : uncontrolledValue}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            rows={autoResize ? minRows : props.rows ?? minRows}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={handleChange}
            data-wensity-textarea=""
            data-error={error ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            data-disabled={disabled ? "" : undefined}
            className={cn(
              "wensity-textarea-control w-full border outline-none",
              "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60",
              "transition-[border-color] duration-150 ease-out",
              "disabled:cursor-not-allowed",
              textareaSizes[textareaSize],
              showCount && countPadding[textareaSize],
              !autoResize && resizeClasses[resize],
              autoResize && "resize-none overflow-hidden",
              variantClasses[variant],
              !disabled && !readOnly && !error && focusClasses,
              error && errorClasses,
              disabled && disabledClasses,
              readOnly && readOnlyClasses,
              textareaClassName,
            )}
            style={{
              minHeight: rowsToHeight(minRows),
              maxHeight: maxRows ? rowsToHeight(maxRows) : undefined,
              ...style,
            }}
            {...props}
          />

          {showCount ? (
            <div
              id={countId}
              aria-live="polite"
              className={cn(
                "pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5",
                "text-[11px] leading-none tabular-nums text-[var(--muted-foreground)]/70",
                maxLength && currentLength > maxLength * 0.9 && "text-amber-600/90 dark:text-amber-400/90",
                maxLength && currentLength >= maxLength && "text-red-600 dark:text-red-400",
              )}
            >
              <IconFileText
                aria-hidden="true"
                className="size-3.5 opacity-70"
                stroke={1.75}
              />
              <span>
                {currentLength}
                {maxLength ? `/${maxLength}` : null}
              </span>
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={errorId}
            className="text-[12px] leading-5 text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={hintId}
            className="text-[12px] leading-5 text-[var(--muted-foreground)]/80"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
