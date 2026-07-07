"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const wensityCardSurfaceSkinClass = cn(
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)] [box-shadow:0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.08)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.4),0_8px_24px_-12px_rgba(0,0,0,.6)]",
);

const wensityCardSurfaceClass = cn(
  "relative isolate overflow-hidden rounded-2xl",
  wensityCardSurfaceSkinClass,
);

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "field" | "filled" | "command" | "pill";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
};

export type SelectGroup = {
  label?: React.ReactNode;
  options: SelectOption[];
};

export interface SelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DropdownMenu.Root>,
    "children" | "modal" | "onOpenChange"
  > {
  id?: string;
  options: SelectOption[] | SelectGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: React.ReactNode;
  selectSize?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  containerClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const triggerSizes: Record<SelectSize, string> = {
  sm: "min-h-8 px-3 text-xs",
  md: "min-h-10 px-3.5 text-sm",
  lg: "min-h-11 px-4 text-[15px]",
};

const contentWidths: Record<SelectSize, string> = {
  sm: "min-w-[12rem]",
  md: "min-w-[15rem]",
  lg: "min-w-[17rem]",
};

const labelSizes: Record<SelectSize, string> = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-[15px]",
};

const smooth =
  "transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

const SELECT_STYLE_ID = "wensity-select-styles";
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_DRAWER_CSS = "cubic-bezier(0.32, 0.72, 0, 1)";

function ensureSelectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SELECT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = SELECT_STYLE_ID;
  style.textContent = `
    [data-wensity-select-content] {
      transform-origin: var(--radix-dropdown-menu-content-transform-origin);
      backface-visibility: hidden;
    }

    [data-wensity-select-content][data-state="open"] {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transition:
        opacity 320ms ${EASE_OUT_CSS},
        transform 380ms ${EASE_DRAWER_CSS};
    }

    [data-wensity-select-content][data-side="bottom"][data-state="open"] {
      @starting-style {
        opacity: 0;
        transform: translate3d(0, -10px, 0);
      }
    }

    [data-wensity-select-content][data-side="top"][data-state="open"] {
      @starting-style {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
      }
    }

    [data-wensity-select-content][data-side="left"][data-state="open"],
    [data-wensity-select-content][data-side="right"][data-state="open"] {
      @starting-style {
        opacity: 0;
        transform: translate3d(0, -8px, 0);
      }
    }

    [data-wensity-select-content][data-state="closed"] {
      opacity: 0;
      transition:
        opacity 220ms ${EASE_OUT_CSS},
        transform 260ms ${EASE_DRAWER_CSS};
    }

    [data-wensity-select-content][data-side="bottom"][data-state="closed"] {
      transform: translate3d(0, -8px, 0);
    }

    [data-wensity-select-content][data-side="top"][data-state="closed"] {
      transform: translate3d(0, 8px, 0);
    }

    [data-wensity-select-content][data-side="left"][data-state="closed"],
    [data-wensity-select-content][data-side="right"][data-state="closed"] {
      transform: translate3d(0, -6px, 0);
    }

    @keyframes wensity-select-item-down {
      from {
        opacity: 0;
        transform: translate3d(0, -10px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes wensity-select-item-up {
      from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    [data-wensity-select-content][data-side="bottom"] [data-slot="select-item"],
    [data-wensity-select-content][data-side="left"] [data-slot="select-item"],
    [data-wensity-select-content][data-side="right"] [data-slot="select-item"] {
      animation: wensity-select-item-down 360ms ${EASE_DRAWER_CSS} backwards;
      animation-delay: calc(40ms + var(--select-item-index, 0) * 36ms);
    }

    [data-wensity-select-content][data-side="top"] [data-slot="select-item"] {
      animation: wensity-select-item-up 360ms ${EASE_DRAWER_CSS} backwards;
      animation-delay: calc(40ms + var(--select-item-index, 0) * 36ms);
    }

    [data-slot="select-check"] {
      display: inline-flex;
      transform: scale(0.92);
      opacity: 0;
      transition:
        transform 220ms ${EASE_OUT_CSS},
        opacity 220ms ${EASE_OUT_CSS};
    }

    [data-state="checked"] [data-slot="select-check"] {
      transform: scale(1);
      opacity: 1;

      @starting-style {
        transform: scale(0.92);
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-wensity-select-content][data-state="open"],
      [data-wensity-select-content][data-state="closed"] {
        transition-duration: 0ms;
        transform: none;
      }

      [data-wensity-select-content][data-state="open"] [data-slot="select-item"] {
        animation: none;
      }

      [data-slot="select-check"] {
        transition-duration: 0ms;
        transform: none;
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

const focusRing = cn(
  "focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_18%,transparent)]",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
);

const triggerBase = cn(
  "group/select-trigger inline-flex items-center justify-between gap-2 rounded-lg border text-left",
  "disabled:cursor-not-allowed disabled:opacity-45",
  smooth,
  focusRing,
);

const variantClasses: Record<SelectVariant, string> = {
  field: cn(
    "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
    "shadow-[0_1px_1px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.28)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_16%,transparent)]",
    "data-[state=open]:border-[color-mix(in_srgb,var(--foreground)_24%,transparent)]",
  ),
  filled: cn(
    "border-transparent bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))] text-[var(--foreground)]",
    "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_5%,transparent)]",
    "hover:bg-[color-mix(in_srgb,var(--foreground)_8%,var(--background))]",
    "dark:bg-[color-mix(in_srgb,var(--foreground)_11%,var(--background))]",
    "dark:hover:bg-[color-mix(in_srgb,var(--foreground)_14%,var(--background))]",
  ),
  command: cn(
    wensityCardSurfaceClass,
    "rounded-xl text-[var(--foreground)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)]",
    "data-[state=open]:border-[color-mix(in_srgb,var(--foreground)_24%,transparent)]",
  ),
  pill: cn(
    "min-h-8 rounded-full border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] text-[var(--foreground)]",
    "px-3 shadow-[0_1px_1px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.28)]",
    "hover:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
  ),
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "size-4 shrink-0 text-[var(--muted-foreground)]",
        "transform-gpu transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        open && "rotate-180",
      )}
    >
      <path
        d="m4.25 6.25 3.75 3.5 3.75-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
      <path
        d="M3.4 8.2 6.45 11.25 12.6 4.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isGroupedOptions(options: SelectOption[] | SelectGroup[]): options is SelectGroup[] {
  return options.length > 0 && "options" in options[0];
}

function flattenOptions(options: SelectOption[] | SelectGroup[]) {
  return isGroupedOptions(options)
    ? options.flatMap((group) => group.options)
    : options;
}

function getNativeOptionLabel(option: SelectOption) {
  return typeof option.label === "string" || typeof option.label === "number"
    ? option.label
    : option.value;
}

function getNativePlaceholderLabel(placeholder: React.ReactNode) {
  return typeof placeholder === "string" || typeof placeholder === "number"
    ? placeholder
    : "Select option";
}

export function Select({
  options,
  id,
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  name,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  label,
  hint,
  error,
  placeholder = "Select option",
  selectSize = "md",
  variant = "field",
  fullWidth = true,
  leadingIcon,
  containerClassName,
  triggerClassName,
  contentClassName,
  ...props
}: SelectProps) {
  const reactId = React.useId();
  const selectId = id ?? `wensity-select-${reactId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const [openState, setOpenState] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const selectedValue = value ?? uncontrolledValue;
  const flattenedOptions = React.useMemo(() => flattenOptions(options), [options]);
  const selectedOption = flattenedOptions.find(
    (option) => option.value === selectedValue,
  );
  const hasEmptyOption = flattenedOptions.some((option) => option.value === "");
  const open = controlledOpen ?? openState;
  const describedBy =
    [ariaDescribedBy, errorId, hintId].filter(Boolean).join(" ") || undefined;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) setOpenState(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  React.useEffect(() => {
    ensureSelectStyles();
  }, []);

  const renderOption = (option: SelectOption, index: number) => (
    <DropdownMenu.RadioItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      data-slot="select-item"
      style={{ ["--select-item-index" as string]: index }}
      className={cn(
        "group/select-item relative flex min-h-10 cursor-default select-none items-start gap-3 rounded-lg px-3 py-2.5 pr-9",
        "text-sm text-[var(--foreground)] outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        "data-[highlighted]:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
        "data-[state=checked]:bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))]",
        "dark:data-[highlighted]:bg-[color-mix(in_srgb,var(--foreground)_10%,var(--background))]",
        "dark:data-[state=checked]:bg-[color-mix(in_srgb,var(--foreground)_13%,var(--background))]",
        smooth,
      )}
    >
      {option.leading ? (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] text-[var(--muted-foreground)] [&_svg]:size-4">
          {option.leading}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium tracking-[-0.01em]">
          {option.label}
        </span>
        {option.description ? (
          <span className="mt-1 block text-[12px] leading-[1.4] text-[var(--muted-foreground)]">
            {option.description}
          </span>
        ) : null}
      </span>
      {option.trailing ? (
        <span className="mt-0.5 shrink-0 text-[12px] font-medium text-[var(--muted-foreground)]">
          {option.trailing}
        </span>
      ) : null}
      <DropdownMenu.ItemIndicator className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]">
        <span data-slot="select-check">
          <CheckIcon />
        </span>
      </DropdownMenu.ItemIndicator>
    </DropdownMenu.RadioItem>
  );

  const renderOptions = () => {
    let itemIndex = 0;

    if (isGroupedOptions(options)) {
      return options.map((group, groupIndex) => (
        <DropdownMenu.Group key={groupIndex}>
          {group.label ? (
            <DropdownMenu.Label className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
              {group.label}
            </DropdownMenu.Label>
          ) : null}
          <div className="space-y-1">
            {group.options.map((option) => renderOption(option, itemIndex++))}
          </div>
        </DropdownMenu.Group>
      ));
    }

    return options.map((option, index) => renderOption(option, index));
  };

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
          htmlFor={selectId}
          className="text-[13px] font-normal leading-none tracking-[-0.01em] text-[var(--foreground)]"
        >
          {label}
        </label>
      ) : null}

      <DropdownMenu.Root
        open={controlledOpen}
        onOpenChange={handleOpenChange}
        modal={false}
        {...props}
      >
        <DropdownMenu.Trigger asChild>
          <button
            id={selectId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid ?? (error ? true : undefined)}
            aria-describedby={describedBy}
            aria-required={ariaRequired ?? required ?? undefined}
            disabled={disabled}
            className={cn(
              triggerBase,
              variantClasses[variant],
              triggerSizes[selectSize],
              fullWidth ? "w-full" : "w-fit",
              error &&
                "border-red-500/45 hover:border-red-500/55 data-[state=open]:border-red-500/65",
              triggerClassName,
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              {leadingIcon || selectedOption?.leading ? (
                <span className="grid size-5 shrink-0 place-items-center text-[var(--muted-foreground)] [&_svg]:size-4">
                  {leadingIcon ?? selectedOption?.leading}
                </span>
              ) : null}
              <span
                className={cn(
                  "min-w-0 flex-1",
                  !selectedOption && "text-[var(--muted-foreground)]",
                )}
              >
                {variant === "command" && selectedOption?.description ? (
                  <>
                    <span className="block truncate font-medium tracking-[-0.015em] text-[var(--foreground)]">
                      {selectedOption.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] leading-none text-[var(--muted-foreground)]">
                      {selectedOption.description}
                    </span>
                  </>
                ) : selectedOption ? (
                  <span className="block truncate font-medium tracking-[-0.015em]">
                    {selectedOption.label}
                  </span>
                ) : (
                  <span className="block truncate">{placeholder}</span>
                )}
              </span>
            </span>
            <ChevronIcon open={open} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={8}
            collisionPadding={12}
            data-wensity-select-content=""
            className={cn(
              wensityCardSurfaceSkinClass,
              "relative isolate z-50 max-h-[min(22rem,var(--radix-dropdown-menu-content-available-height))] overflow-x-hidden overflow-y-auto rounded-xl p-1.5 text-[var(--foreground)]",
              contentWidths[selectSize],
              fullWidth && "w-[var(--radix-dropdown-menu-trigger-width)]",
              contentClassName,
            )}
          >
            <DropdownMenu.RadioGroup
              value={selectedValue}
              onValueChange={handleValueChange}
            >
              {renderOptions()}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {name ? (
        <select
          className="sr-only"
          tabIndex={-1}
          name={name}
          value={selectedValue ?? ""}
          onChange={(event) => handleValueChange(event.target.value)}
          required={required}
          disabled={disabled}
        >
          {!hasEmptyOption ? (
            <option value="">{getNativePlaceholderLabel(placeholder)}</option>
          ) : null}
          {flattenedOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {getNativeOptionLabel(option)}
            </option>
          ))}
        </select>
      ) : null}

      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.45] text-[var(--muted-foreground)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="text-[12px] leading-[1.45] font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
