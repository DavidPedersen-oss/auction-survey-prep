"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  inputSize?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

const fieldSizes: Record<InputSize, string> = {
  sm: "min-h-8 rounded-md",
  md: "min-h-10 rounded-lg",
  lg: "min-h-11 rounded-lg",
};

const inputSizes: Record<InputSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-3.5 text-sm",
  lg: "h-11 px-4 text-[15px]",
};

const iconPad: Record<InputSize, string> = {
  sm: "pl-2.5",
  md: "pl-3",
  lg: "pl-3.5",
};

const trailingPad: Record<InputSize, string> = {
  sm: "pr-2",
  md: "pr-2.5",
  lg: "pr-3",
};

const fieldBase = cn(
  "wensity-input-shell group/input relative isolate flex w-full items-center overflow-hidden",
  "border border-[var(--border)] bg-[var(--background)]",
  "transition-[border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
);

const fieldInteractive = cn(
  "hover:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
  "focus-within:border-[color-mix(in_srgb,var(--foreground)_24%,transparent)]",
);

const fieldError = cn(
  "border-red-500/45",
  "hover:border-red-500/55",
  "focus-within:border-red-500/65",
);

const fieldDisabled = cn(
  "cursor-not-allowed opacity-45",
  "hover:border-[var(--border)]",
);

const fieldReadOnly = cn(
  "border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_2.5%,var(--background))]",
  "hover:border-[var(--border)]",
);

const iconSlot = cn(
  "wensity-input-icon inline-flex shrink-0 items-center justify-center text-[var(--muted-foreground)]/55",
  "transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "group-focus-within/input:text-[var(--muted-foreground)]",
  "group-data-[filled]/input:text-[var(--muted-foreground)]/80",
  "[&_svg]:size-[15px] [&_svg]:shrink-0",
);

const INPUT_STYLE_ID = "wensity-input-styles";

function ensureInputStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(INPUT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = INPUT_STYLE_ID;
  style.textContent = `
    [data-wensity-input].wensity-input-shell::after {
      content: "";
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 0;
      height: 1px;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 28%, transparent), transparent);
      opacity: 0;
      pointer-events: none;
      transform: scaleX(0.72);
      transform-origin: center;
      transition: opacity 150ms cubic-bezier(0.23, 1, 0.32, 1), transform 180ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    [data-wensity-input].wensity-input-shell:focus-within::after {
      opacity: 1;
      transform: scaleX(1);
    }

    [data-wensity-input].wensity-input-shell:has(.wensity-input-control:focus-visible)::after {
      transition-duration: 0ms;
    }

    @media (hover: hover) and (pointer: fine) {
      [data-wensity-input].wensity-input-shell:hover:not([data-disabled]):not([data-readonly]):not([data-error]) {
        background: color-mix(in srgb, var(--foreground) 1.5%, var(--background));
      }
    }

    .wensity-input-clear {
      transform: translateZ(0) scale(1);
      transition: color 150ms cubic-bezier(0.23, 1, 0.32, 1), opacity 140ms cubic-bezier(0.23, 1, 0.32, 1), transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    .wensity-input-clear-icon {
      transform: rotate(0deg);
      transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    @media (hover: hover) and (pointer: fine) {
      .wensity-input-clear:hover {
        color: var(--foreground);
      }
    }

    .wensity-input-clear:active {
      transform: translateZ(0) scale(0.96);
    }

    .wensity-input-clear:active .wensity-input-clear-icon {
      transform: rotate(90deg);
    }

    .wensity-input-message {
      transition: opacity 140ms cubic-bezier(0.23, 1, 0.32, 1), transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    @starting-style {
      .wensity-input-clear {
        opacity: 0;
        transform: translateZ(0) scale(0.96);
      }

      .wensity-input-message {
        opacity: 0;
        transform: translate3d(0, -2px, 0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-wensity-input].wensity-input-shell::after,
      .wensity-input-clear,
      .wensity-input-clear-icon,
      .wensity-input-message {
        transition-duration: 0ms !important;
        transform: none !important;
      }
    }

    [data-wensity-input] .wensity-input-control:-webkit-autofill,
    [data-wensity-input] .wensity-input-control:-webkit-autofill:hover,
    [data-wensity-input] .wensity-input-control:-webkit-autofill:focus,
    [data-wensity-input] .wensity-input-control:-webkit-autofill:active,
    [data-wensity-input] .wensity-input-control:autofill {
      -webkit-box-shadow: 0 0 0 1000px var(--background) inset !important;
      box-shadow: 0 0 0 1000px var(--background) inset !important;
      -webkit-text-fill-color: var(--foreground) !important;
      color: var(--foreground) !important;
      caret-color: var(--foreground);
      transition: background-color 99999s ease-out 0s;
    }

    [data-wensity-input][data-error] .wensity-input-control:-webkit-autofill,
    [data-wensity-input][data-error] .wensity-input-control:-webkit-autofill:hover,
    [data-wensity-input][data-error] .wensity-input-control:-webkit-autofill:focus,
    [data-wensity-input][data-error] .wensity-input-control:-webkit-autofill:active,
    [data-wensity-input][data-error] .wensity-input-control:autofill {
      -webkit-box-shadow: 0 0 0 1000px var(--background) inset !important;
      box-shadow: 0 0 0 1000px var(--background) inset !important;
    }

    [data-wensity-input][data-readonly] .wensity-input-control:-webkit-autofill,
    [data-wensity-input][data-readonly] .wensity-input-control:-webkit-autofill:hover,
    [data-wensity-input][data-readonly] .wensity-input-control:-webkit-autofill:focus,
    [data-wensity-input][data-readonly] .wensity-input-control:-webkit-autofill:active,
    [data-wensity-input][data-readonly] .wensity-input-control:autofill {
      -webkit-box-shadow: 0 0 0 1000px color-mix(in srgb, var(--foreground) 2.5%, var(--background)) inset !important;
      box-shadow: 0 0 0 1000px color-mix(in srgb, var(--foreground) 2.5%, var(--background)) inset !important;
      -webkit-text-fill-color: var(--muted-foreground) !important;
      color: var(--muted-foreground) !important;
    }

    [data-wensity-input]:hover:not([data-disabled]):not([data-readonly]):not([data-error]) .wensity-input-control:-webkit-autofill,
    [data-wensity-input]:hover:not([data-disabled]):not([data-readonly]):not([data-error]) .wensity-input-control:-webkit-autofill:hover,
    [data-wensity-input]:hover:not([data-disabled]):not([data-readonly]):not([data-error]) .wensity-input-control:autofill {
      -webkit-box-shadow: 0 0 0 1000px var(--background) inset !important;
      box-shadow: 0 0 0 1000px var(--background) inset !important;
    }
  `;
  document.head.appendChild(style);
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      className,
      containerClassName,
      inputClassName,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      inputSize = "md",
      fullWidth = true,
      disabled,
      readOnly,
      value,
      defaultValue,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `wensity-input-${reactId}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue?.toString() ?? "",
    );
    const currentValue = isControlled ? value : uncontrolledValue;
    const hasValue = currentValue != null && String(currentValue).length > 0;
    const showClear = clearable && hasValue && !disabled && !readOnly;
    const describedBy =
      [ariaDescribedBy, errorId, hintId].filter(Boolean).join(" ") || undefined;

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolledValue(event.target.value);
        onChange?.(event);
      },
      [isControlled, onChange],
    );

    const handleClear = React.useCallback(() => {
      if (!isControlled) setUncontrolledValue("");
      onClear?.();
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => inputRef.current?.focus());
      } else {
        inputRef.current?.focus();
      }
    }, [isControlled, onClear]);

    const handleClearPointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
      [],
    );

    React.useLayoutEffect(() => {
      ensureInputStyles();
    }, []);

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth ? "w-full" : "w-fit",
          containerClassName,
        )}
      >
        {label ? (
          <label
            htmlFor={inputId}
            className="text-[13px] font-normal leading-none tracking-[-0.01em] text-[var(--foreground)]"
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            "relative",
            fullWidth ? "w-full" : "w-fit",
            className,
          )}
        >
          <div
            data-wensity-input=""
            data-filled={hasValue ? "" : undefined}
            data-error={error ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            data-disabled={disabled ? "" : undefined}
            className={cn(
              fieldBase,
              !disabled && !readOnly && !error && fieldInteractive,
              error && fieldError,
              disabled && fieldDisabled,
              readOnly && fieldReadOnly,
              fieldSizes[inputSize],
            )}
          >
            {leftIcon ? (
              <span
                aria-hidden="true"
                className={cn(iconSlot, iconPad[inputSize])}
              >
                {leftIcon}
              </span>
            ) : null}

            <input
              ref={setRefs}
              id={inputId}
              value={isControlled ? value : uncontrolledValue}
              disabled={disabled}
              readOnly={readOnly}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onChange={handleChange}
              className={cn(
                "wensity-input-control min-w-0 flex-1 border-0 bg-transparent text-[var(--foreground)] outline-none",
                "placeholder:text-[var(--muted-foreground)]/60",
                "disabled:cursor-not-allowed",
                "read-only:cursor-default read-only:text-[var(--muted-foreground)]",
                inputSizes[inputSize],
                inputClassName,
              )}
              {...props}
            />

            {showClear ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center",
                  trailingPad[inputSize],
                )}
              >
                <button
                  type="button"
                  aria-label="Clear input"
                  onPointerDown={handleClearPointerDown}
                  onClick={handleClear}
                  className={cn(
                    "wensity-input-clear grid size-6 transform-gpu place-items-center text-[var(--muted-foreground)]/70",
                    "focus-visible:outline-none focus-visible:text-[var(--foreground)]",
                  )}
                >
                  <IconX
                    aria-hidden="true"
                    className="wensity-input-clear-icon size-3.5"
                  />
                </button>
              </span>
            ) : rightIcon ? (
              <span
                aria-hidden="true"
                className={cn(iconSlot, trailingPad[inputSize])}
              >
                {rightIcon}
              </span>
            ) : null}
          </div>
        </div>

        {error ? (
          <p
            id={errorId}
            className="wensity-input-message text-[12px] leading-5 text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={hintId}
            className="wensity-input-message text-[12px] leading-5 text-[var(--muted-foreground)]/80"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
