"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const wensityCardSurfaceClass = cn(
  "relative isolate overflow-hidden rounded-2xl",
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)] [box-shadow:0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.08)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.4),0_8px_24px_-12px_rgba(0,0,0,.6)]",
);

const wensityCardInteractiveClass =
  "transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]";

export type CheckboxCheckedState = boolean | "indeterminate";
export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxVariant = "classic" | "soft";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "onChange" | "size" | "type"
  > {
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  onCheckedChange?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  checkboxSize?: CheckboxSize;
  variant?: CheckboxVariant;
  fullWidth?: boolean;
  containerClassName?: string;
  controlClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

export interface CheckboxGroupProps
  extends React.HTMLAttributes<HTMLFieldSetElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}

export interface CheckboxCardProps extends CheckboxProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const controlSizes: Record<CheckboxSize, string> = {
  sm: "size-[15px]",
  md: "size-[18px]",
  lg: "size-[21px]",
};

const rowGap: Record<CheckboxSize, string> = {
  sm: "gap-2.5",
  md: "gap-3",
  lg: "gap-3.5",
};

const labelSizes: Record<CheckboxSize, string> = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-[15px]",
};

const controlOffset: Record<CheckboxSize, string> = {
  sm: "mt-px",
  md: "mt-0.5",
  lg: "mt-0.5",
};

const focusRing = cn(
  "peer-focus-visible:outline-none",
  "peer-focus-visible:ring-2 peer-focus-visible:ring-[color-mix(in_srgb,var(--foreground)_18%,transparent)]",
  "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)]",
);

const smoothControlTransition =
  "transition-[background-color,border-color,box-shadow,opacity] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

const smoothMarkTransition =
  "transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

const CHECKBOX_STYLE_ID = "wensity-checkbox-styles-v10";
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_DRAWER_CSS = "cubic-bezier(0.32, 0.72, 0, 1)";
const CLASSIC_FILL_MS = 240;
const CLASSIC_TICK_DELAY_MS = 220;

function ensureCheckboxStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CHECKBOX_STYLE_ID)) return;

  for (const id of [
    "wensity-checkbox-styles",
    "wensity-checkbox-styles-v2",
    "wensity-checkbox-styles-v3",
    "wensity-checkbox-styles-v4",
    "wensity-checkbox-styles-v5",
    "wensity-checkbox-styles-v6",
    "wensity-checkbox-styles-v7",
    "wensity-checkbox-styles-v8",
    "wensity-checkbox-styles-v9",
  ]) {
    document.getElementById(id)?.remove();
  }

  const style = document.createElement("style");
  style.id = CHECKBOX_STYLE_ID;
  style.textContent = `
    [data-slot="checkbox-check-soft"] {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      opacity: 0;
      transition:
        stroke-dashoffset 260ms ${EASE_OUT_CSS},
        opacity 180ms ${EASE_OUT_CSS};
    }

    [data-checkbox][data-state="checked"] [data-slot="checkbox-check-soft"] {
      stroke-dashoffset: 0;
      opacity: 1;
      transition-duration: 260ms;
    }

    [data-checkbox][data-state="unchecked"] [data-slot="checkbox-check-soft"] {
      stroke-dashoffset: 1;
      opacity: 0;
      transition-duration: 180ms;
    }

    [data-slot="checkbox-classic-fill"] {
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform ${CLASSIC_FILL_MS}ms ${EASE_DRAWER_CSS};
    }

    [data-slot="checkbox-classic-fill"][data-active="true"] {
      transform: scaleX(1);
      transition-duration: ${CLASSIC_FILL_MS}ms;
      transition-delay: 0ms;
    }

    [data-slot="checkbox-classic-fill"][data-active="false"] {
      transform: scaleX(0);
      transition-duration: 200ms;
      transition-delay: 120ms;
    }

    [data-slot="checkbox-check-classic"] {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      opacity: 0;
      transition:
        stroke-dashoffset 280ms ${EASE_OUT_CSS} ${CLASSIC_TICK_DELAY_MS}ms,
        opacity 200ms ${EASE_OUT_CSS} ${CLASSIC_TICK_DELAY_MS}ms;
    }

    [data-checkbox][data-state="checked"] [data-slot="checkbox-check-classic"] {
      stroke-dashoffset: 0;
      opacity: 1;
    }

    [data-checkbox][data-state="unchecked"] [data-slot="checkbox-check-classic"] {
      stroke-dashoffset: 1;
      opacity: 0;
      transition:
        stroke-dashoffset 140ms ${EASE_OUT_CSS} 0ms,
        opacity 120ms ${EASE_OUT_CSS} 0ms;
    }

    [data-checkbox][data-variant="classic"] [data-slot="checkbox-control"] {
      transition:
        border-color 240ms ${EASE_OUT_CSS},
        box-shadow 240ms ${EASE_OUT_CSS};
    }

    @media (prefers-reduced-motion: reduce) {
      [data-slot="checkbox-check-soft"],
      [data-slot="checkbox-check-classic"] {
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
        stroke-dashoffset: 0;
      }

      [data-slot="checkbox-classic-fill"] {
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
      }

      [data-slot="checkbox-classic-fill"][data-active="true"] {
        transform: scaleX(1);
      }

      [data-slot="checkbox-classic-fill"][data-active="false"] {
        transform: scaleX(0);
      }

      [data-checkbox][data-variant="classic"] [data-slot="checkbox-control"] {
        transition-duration: 0ms !important;
      }

      [data-checkbox][data-state="unchecked"] [data-slot="checkbox-check-soft"],
      [data-checkbox][data-state="unchecked"] [data-slot="checkbox-check-classic"] {
        opacity: 0;
      }

      [data-checkbox][data-state="checked"] [data-slot="checkbox-check-soft"],
      [data-checkbox][data-state="checked"] [data-slot="checkbox-check-classic"] {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

const checkPath = "M3.25 8.1 6.35 11.2 12.75 4.6";

const checkSizes: Record<CheckboxSize, string> = {
  sm: "size-2.5",
  md: "size-3",
  lg: "size-3.5",
};

function getControlClasses({
  variant,
  checked,
  indeterminate,
  disabled,
  error,
  checkboxSize,
}: {
  variant: CheckboxVariant;
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  checkboxSize: CheckboxSize;
}) {
  const active = checked || indeterminate;

  if (variant === "soft") {
    return cn(
      "relative grid shrink-0 place-items-center rounded-[7px] border",
      smoothControlTransition,
      "border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]",
      "shadow-[0_1px_1px_rgba(0,0,0,0.03)]",
      "dark:shadow-[0_1px_2px_rgba(0,0,0,0.28)]",
      focusRing,
      !disabled &&
        "group-hover/checkbox:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] group-hover/checkbox:bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))]",
      active &&
        cn(
          "border-[color-mix(in_srgb,var(--foreground)_32%,transparent)]",
          "bg-[color-mix(in_srgb,var(--foreground)_13%,var(--background))]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_color-mix(in_srgb,var(--foreground)_8%,transparent)]",
          "dark:bg-[color-mix(in_srgb,var(--foreground)_18%,var(--background))]",
          "dark:shadow-[0_1px_3px_rgba(0,0,0,0.32),0_0_0_1px_color-mix(in_srgb,var(--foreground)_12%,transparent)]",
        ),
      error &&
        "border-red-500/55 bg-red-500/[0.06] shadow-[0_0_0_1px_rgba(239,68,68,0.08)]",
      disabled && "cursor-not-allowed opacity-40",
      controlSizes[checkboxSize],
    );
  }

  return cn(
    "relative grid shrink-0 place-items-center overflow-hidden rounded-[5px] border",
    smoothControlTransition,
    "border-[var(--border-strong)] bg-[var(--background)]",
    "shadow-[0_1px_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]",
    "dark:shadow-[0_1px_2px_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.04)]",
    focusRing,
    !disabled &&
      "group-hover/checkbox:border-[color-mix(in_srgb,var(--foreground)_26%,transparent)]",
    active &&
      cn(
        "border-[var(--foreground)]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_1px_3px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)]",
      ),
    error && "border-red-500/55",
    disabled && "cursor-not-allowed opacity-40",
    controlSizes[checkboxSize],
  );
}

function CheckboxMark({
  variant,
  checked,
  indeterminate,
  checkboxSize,
}: {
  variant: CheckboxVariant;
  checked: boolean;
  indeterminate: boolean;
  checkboxSize: CheckboxSize;
}) {
  const active = checked || indeterminate;

  if (indeterminate) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "rounded-full transform-gpu origin-center",
          smoothMarkTransition,
          "opacity-100 scale-100",
          variant === "classic" && "relative z-[1]",
          variant === "classic"
            ? "bg-[var(--background)]"
            : "bg-[var(--foreground)]",
          checkboxSize === "sm" && "h-0.5 w-2",
          checkboxSize === "md" && "h-0.5 w-2.5",
          checkboxSize === "lg" && "h-[3px] w-3",
        )}
      />
    );
  }

  if (variant === "soft") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className={cn(checkSizes[checkboxSize], "text-[var(--foreground)]")}
      >
        <path
          data-slot="checkbox-check-soft"
          d={checkPath}
          pathLength={1}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: active ? 1 : 0,
            strokeDasharray: 1,
            strokeDashoffset: active ? 0 : 1,
          }}
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        checkSizes[checkboxSize],
        "relative z-[1] text-[var(--background)]",
      )}
    >
      <path
        data-slot="checkbox-check-classic"
        d={checkPath}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: active ? 1 : 0,
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
        }}
      />
    </svg>
  );
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      className,
      containerClassName,
      controlClassName,
      labelClassName,
      descriptionClassName,
      label,
      description,
      error,
      checkboxSize = "md",
      variant = "classic",
      fullWidth = true,
      checked,
      defaultChecked = false,
      disabled,
      onCheckedChange,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const checkboxId = id ?? `checkbox-${reactId}`;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isControlled = checked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<CheckboxCheckedState>(defaultChecked);
    const currentChecked = isControlled ? checked : uncontrolledChecked;
    const isChecked = currentChecked === true;
    const isIndeterminate = currentChecked === "indeterminate";
    const describedBy =
      [ariaDescribedBy, errorId, descriptionId].filter(Boolean).join(" ") ||
      undefined;

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

    React.useLayoutEffect(() => {
      ensureCheckboxStyles();
    }, []);

    React.useLayoutEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
    }, [isIndeterminate]);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = event.currentTarget.checked;
        if (!isControlled) setUncontrolledChecked(nextChecked);
        onCheckedChange?.(nextChecked, event);
        onChange?.(event);
      },
      [isControlled, onChange, onCheckedChange],
    );

    const isActive = isChecked || isIndeterminate;

    return (
      <label
        data-checkbox=""
        data-variant={variant}
        data-state={
          isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"
        }
        data-disabled={disabled ? "" : undefined}
        data-error={error ? "" : undefined}
        className={cn(
          "group/checkbox relative flex cursor-pointer select-none items-start",
          rowGap[checkboxSize],
          fullWidth ? "w-full" : "w-fit",
          disabled && "cursor-not-allowed",
          containerClassName,
          className,
        )}
      >
        <input
          ref={setRefs}
          id={checkboxId}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          aria-checked={isIndeterminate ? "mixed" : isChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <span
          data-slot="checkbox-control"
          className={cn(
            controlOffset[checkboxSize],
            getControlClasses({
              variant,
              checked: isChecked,
              indeterminate: isIndeterminate,
              disabled,
              error,
              checkboxSize,
            }),
            controlClassName,
          )}
        >
          {variant === "classic" ? (
            <span
              aria-hidden="true"
              data-slot="checkbox-classic-fill"
              data-active={isActive ? "true" : "false"}
              className="pointer-events-none absolute inset-0 rounded-[5px] bg-[var(--foreground)] transform-gpu"
              style={{ transform: isActive ? "scaleX(1)" : "scaleX(0)" }}
            />
          ) : null}
          <CheckboxMark
            variant={variant}
            checked={isChecked}
            indeterminate={isIndeterminate}
            checkboxSize={checkboxSize}
          />
        </span>

        {label || description || error ? (
          <span className="min-w-0 flex-1 pt-px">
            {label ? (
              <span
                className={cn(
                  "block font-medium leading-snug tracking-[-0.015em] text-[var(--foreground)]",
                  labelSizes[checkboxSize],
                  disabled && "text-[var(--muted-foreground)]",
                  labelClassName,
                )}
              >
                {label}
              </span>
            ) : null}
            {description ? (
              <span
                id={descriptionId}
                className={cn(
                  "mt-1 block text-[12px] leading-[1.45] text-[var(--muted-foreground)]",
                  descriptionClassName,
                )}
              >
                {description}
              </span>
            ) : null}
            {error ? (
              <span
                id={errorId}
                className="mt-1.5 block text-[12px] leading-[1.45] font-medium text-red-600 dark:text-red-400"
              >
                {error}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export function CheckboxGroup({
  label,
  description,
  error,
  children,
  className,
  ...props
}: CheckboxGroupProps) {
  const reactId = React.useId();
  const descriptionId = description
    ? `checkbox-group-${reactId}-description`
    : undefined;
  const errorId = error ? `checkbox-group-${reactId}-error` : undefined;

  return (
    <fieldset
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
      className={cn("space-y-3.5", className)}
      {...props}
    >
      {label || description ? (
        <div className="space-y-1">
          {label ? (
            <legend className="text-sm font-semibold tracking-[-0.015em] text-[var(--foreground)]">
              {label}
            </legend>
          ) : null}
          {description ? (
            <p
              id={descriptionId}
              className="text-[12px] leading-[1.45] text-[var(--muted-foreground)]"
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
      {error ? (
        <p
          id={errorId}
          className="text-[12px] leading-[1.45] font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function CheckboxCard({
  leading,
  trailing,
  className,
  containerClassName,
  checkboxSize = "md",
  variant = "soft",
  id,
  disabled,
  ...props
}: CheckboxCardProps) {
  const reactId = React.useId();
  const checkboxId = id ?? `checkbox-card-${reactId}`;

  return (
    <div
      className={cn(
        "group/checkbox-card",
        wensityCardSurfaceClass,
        !disabled && wensityCardInteractiveClass,
        "has-[[data-state=checked]]:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)]",
        "has-[[data-state=checked]]:[box-shadow:0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        "dark:has-[[data-state=checked]]:[box-shadow:0_1px_3px_rgba(0,0,0,0.38),0_0_0_1px_color-mix(in_srgb,var(--foreground)_10%,transparent)]",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {leading ? (
          <div
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--border)]",
              "bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] text-[var(--muted-foreground)]",
              "transition-[border-color,background-color,color] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              "group-has-[[data-state=checked]]/checkbox-card:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
              "group-has-[[data-state=checked]]/checkbox-card:bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))]",
              "group-has-[[data-state=checked]]/checkbox-card:text-[var(--foreground)]",
              "[&_svg]:size-[17px]",
            )}
          >
            {leading}
          </div>
        ) : null}
        <Checkbox
          {...props}
          id={checkboxId}
          disabled={disabled}
          checkboxSize={checkboxSize}
          variant={variant}
          containerClassName={cn("flex-1", containerClassName)}
        />
        {trailing ? (
          <div className="shrink-0 pt-0.5">
            <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] px-2 py-0.5 text-[11px] font-medium tracking-[0.01em] text-[var(--muted-foreground)]">
              {trailing}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
