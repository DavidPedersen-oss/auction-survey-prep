"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const wensityCardSurfaceClass = cn(
  "relative isolate overflow-hidden rounded-2xl",
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)] [box-shadow:0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.08)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.4),0_8px_24px_-12px_rgba(0,0,0,.6)]",
);

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "white"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Animate the left icon on hover. */
  leftIconMotion?: "trash" | "mail";
  /** Animate the right icon on hover. */
  rightIconMotion?: "arrow" | "download";
}

const base =
  "wensity-button relative inline-flex shrink-0 transform-gpu items-center justify-center gap-2 whitespace-nowrap rounded-[14px] shadow-none " +
  "text-sm font-medium select-none touch-manipulation " +
  "transition-[background-color,border-color,color,opacity,transform] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-[background-color,border-color,color,opacity] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const pressable =
  "active:[transform:scale(0.97)] active:duration-100 motion-reduce:active:[transform:none] disabled:active:[transform:none]";

const variants: Record<ButtonVariant, string> = {
  default: cn(
    pressable,
    "border border-[#31383d] bg-[#24292d] text-white " +
      "hover:border-[#3b444a] hover:bg-[#2c3237] " +
      "active:border-[#272d31] active:bg-[#1e2326] " +
      "dark:border-white/18 dark:bg-[#f5f3ee] dark:text-[#151719] " +
      "dark:hover:border-white/26 dark:hover:bg-[#ffffff] " +
      "dark:active:border-white/20 dark:active:bg-[#e8e4da]",
  ),
  secondary: cn(
    pressable,
    "border border-[#d7dde3] bg-[#f4f6f8] text-[#24292d] " +
      "hover:border-[#cbd3da] hover:bg-[#eef2f6] " +
      "active:border-[#c4ccd4] active:bg-[#e5ebf1] " +
      "dark:border-white/[0.08] dark:bg-[#0a0a0a] dark:text-[#f5f5f2] " +
      "dark:hover:border-white/14 dark:hover:bg-[#111111] " +
      "dark:active:border-white/10 dark:active:bg-[#000000]",
  ),
  outline: cn(
    pressable,
    "border border-[#d5dbe1] bg-transparent text-[#24292d] " +
      "hover:border-[#c4ccd4] hover:bg-[#f4f6f8] " +
      "active:border-[#b8c0c8] active:bg-[#eef2f6] " +
      "dark:border-white/11 dark:bg-transparent dark:text-[#f5f6f2] " +
      "dark:hover:border-white/18 dark:hover:bg-white/[0.06] " +
      "dark:active:border-white/14 dark:active:bg-white/[0.04]",
  ),
  ghost: cn(
    pressable,
    "border border-transparent bg-transparent text-[var(--muted-foreground)] " +
      "hover:border-[#d9dfe5] hover:bg-[#f4f6f8] hover:text-[#24292d] " +
      "active:border-[#d0d6dc] active:bg-[#eef2f6] " +
      "dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-[#f5f6f2] " +
      "dark:active:border-white/08 dark:active:bg-white/[0.04]",
  ),
  white: cn(
    pressable,
    "border border-[#e2e5e8] bg-[#ffffff] text-[#171a1d] " +
      "hover:border-[#d3d8dd] hover:bg-[#f8f9fa] " +
      "active:border-[#c8cdd2] active:bg-[#f1f3f5] " +
      "dark:border-white/18 dark:bg-[#f5f3ee] dark:text-[#151719] " +
      "dark:hover:border-white/26 dark:hover:bg-[#ffffff] " +
      "dark:active:border-white/20 dark:active:bg-[#e8e4da]",
  ),
  destructive: cn(
    pressable,
    "border border-red-500/78 bg-[#e03434] text-white " +
      "hover:border-red-400/85 hover:bg-[#ef4444] " +
      "active:border-red-700 active:bg-[#c92525] " +
      "dark:border-red-300/32 dark:bg-[#dc2626] " +
      "dark:hover:border-red-200/42 dark:hover:bg-[#ef4444] " +
      "dark:active:border-red-400/50 dark:active:bg-[#b91c1c]",
  ),
  link:
    "h-auto border border-transparent bg-transparent px-0 font-medium text-[var(--foreground)] underline-offset-4 " +
    "hover:text-[var(--muted-foreground)] hover:underline hover:decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] " +
    "active:[transform:none] active:text-[var(--foreground)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-xs",
  md: "h-9 gap-2 px-4",
  lg: "h-10 gap-2 px-5 text-[15px]",
  icon: "h-9 w-9 gap-0 p-0",
};

const ICON_SHELL = "relative z-10 inline-flex shrink-0";

const ICON_MOTION_SHELL =
  "btn-icon-motion inline-flex shrink-0 origin-center transform-gpu";

const leftIconMotionClass = {
  trash: cn(ICON_MOTION_SHELL, "btn-icon-motion--trash"),
  mail: cn(ICON_MOTION_SHELL, "btn-icon-motion--mail"),
} as const;

const rightIconMotionClass = {
  arrow: cn(ICON_MOTION_SHELL, "btn-icon-motion--arrow"),
  download: cn(ICON_MOTION_SHELL, "btn-icon-motion--download"),
} as const;

const BUTTON_ICON_KEYFRAMES_ID = "button-icon-keyframes";

function ensureButtonIconKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(BUTTON_ICON_KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = BUTTON_ICON_KEYFRAMES_ID;
  style.textContent = `
    @keyframes button-trash-shake {
      0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
      24% { transform: translate3d(-0.5px, -1px, 0) rotate(-4deg); }
      48% { transform: translate3d(0.5px, -1px, 0) rotate(3deg); }
      72% { transform: translate3d(-0.25px, -0.5px, 0) rotate(-1.5deg); }
    }
    @keyframes button-mail-lift {
      0% { transform: translate3d(0, 0, 0) rotate(0deg); }
      46% { transform: translate3d(2px, -2px, 0) rotate(-5deg); }
      100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    }
    @keyframes button-download-tick {
      0%, 100% { transform: translate3d(0, 0, 0); }
      46% { transform: translate3d(0, 2.5px, 0); }
    }
    .btn-icon-motion--arrow {
      transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
      .wensity-button:hover .btn-icon-motion--trash {
        animation: button-trash-shake 340ms cubic-bezier(0.23, 1, 0.32, 1) both;
      }
      .wensity-button:hover .btn-icon-motion--mail {
        animation: button-mail-lift 320ms cubic-bezier(0.23, 1, 0.32, 1) both;
      }
      .wensity-button:hover .btn-icon-motion--arrow {
        transform: translate3d(2px, 0, 0);
      }
      .wensity-button:active .btn-icon-motion--arrow {
        transform: translate3d(1px, 0, 0);
      }
      .wensity-button:hover .btn-icon-motion--download {
        animation: button-download-tick 300ms cubic-bezier(0.23, 1, 0.32, 1) both;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .btn-icon-motion {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      leftIconMotion,
      rightIconMotion,
      children,
      type,
      onClickCapture,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const hasIconMotion = Boolean(leftIconMotion || rightIconMotion);

    const handleClickCapture = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (asChild && isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClickCapture?.(event);
      },
      [asChild, isDisabled, onClickCapture],
    );

    React.useLayoutEffect(() => {
      if (hasIconMotion) ensureButtonIconKeyframes();
    }, [hasIconMotion]);

    return (
      <Comp
        ref={ref}
        className={buttonVariants({
          variant,
          size,
          className: cn(
            hasIconMotion && "group",
            asChild && isDisabled && "pointer-events-none opacity-45",
            className,
          ),
        })}
        aria-disabled={asChild && isDisabled ? true : undefined}
        aria-busy={loading ? true : undefined}
        disabled={!asChild ? isDisabled : undefined}
        data-loading={loading ? "" : undefined}
        onClickCapture={handleClickCapture}
        tabIndex={asChild && isDisabled ? -1 : tabIndex}
        type={!asChild ? (type ?? "button") : undefined}
        {...props}
      >
        {loading && <ButtonSpinner />}
        {!loading && leftIcon && (
          <span
            className={cn(
              ICON_SHELL,
              leftIconMotion && leftIconMotionClass[leftIconMotion],
            )}
          >
            {leftIcon}
          </span>
        )}
        {size === "icon" && !loading && !leftIcon && !rightIcon ? (
          <span className={cn(ICON_SHELL, "items-center justify-center")}>
            {children}
          </span>
        ) : (
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
        )}
        {!loading && rightIcon && (
          <span
            className={cn(
              ICON_SHELL,
              rightIconMotion && rightIconMotionClass[rightIconMotion],
            )}
          >
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="relative z-10 size-3.5 shrink-0 rounded-full border-2 border-current border-r-transparent opacity-80 motion-safe:animate-spin"
    />
  );
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        "relative inline-flex overflow-hidden rounded-[14px] border border-[var(--border-strong)] bg-transparent",
        orientation === "horizontal" ? "flex-row items-stretch" : "flex-col",
        className,
      )}
      {...props}
    />
  );
}

const groupItemClass =
  "rounded-none border-0 shadow-none min-h-9 " +
  "focus-visible:relative focus-visible:z-10 hover:z-10";

const groupIconItemClass = "size-9 min-w-9 shrink-0 px-0";

export type ButtonGroupItemProps = ButtonProps;

export const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(({ className, variant = "outline", size, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        groupItemClass,
        size === "icon" && groupIconItemClass,
        className,
      )}
      {...props}
    />
  );
});

ButtonGroupItem.displayName = "ButtonGroupItem";

export interface ButtonGroupSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--border-strong)]",
        orientation === "vertical" ? "w-px self-stretch" : "h-px w-full",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonGroupMenu(
  props: React.ComponentProps<typeof DropdownMenu.Root>,
) {
  return <DropdownMenu.Root modal={false} {...props} />;
}

const menuTriggerClass =
  "data-[state=open]:z-20 data-[state=open]:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]";

export const ButtonGroupMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(({ className, size = "icon", ...props }, ref) => {
  return (
    <DropdownMenu.Trigger asChild>
      <ButtonGroupItem
        ref={ref}
        size={size}
        className={cn(menuTriggerClass, className)}
        {...props}
      />
    </DropdownMenu.Trigger>
  );
});

ButtonGroupMenuTrigger.displayName = "ButtonGroupMenuTrigger";

export interface ButtonGroupMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Content> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function ButtonGroupMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ButtonGroupMenuContentProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          wensityCardSurfaceClass,
          "z-50 min-w-[12.5rem] origin-top-right rounded-[10px] p-1",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

export interface ButtonGroupMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> {
  icon?: React.ReactNode;
  destructive?: boolean;
  shortcut?: string;
}

export const ButtonGroupMenuItem = React.forwardRef<
  HTMLDivElement,
  ButtonGroupMenuItemProps
>(
  (
    { className, children, icon, destructive = false, shortcut, ...props },
    ref,
  ) => {
    return (
      <DropdownMenu.Item
        ref={ref}
        className={cn(
          "group/menu-item relative flex cursor-pointer select-none items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-sm outline-none",
          "transition-colors duration-150",
          destructive
            ? "text-red-600 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-600 dark:text-red-400 dark:data-[highlighted]:text-red-400"
            : "text-[var(--foreground)] data-[highlighted]:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span
            className={cn(
              "inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
              destructive
                ? "text-red-500/90 dark:text-red-400/90"
                : "text-[var(--muted-foreground)] group-data-[highlighted]/menu-item:text-[var(--foreground)]",
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {shortcut ? (
          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-[var(--muted-foreground)]">
            {shortcut}
          </span>
        ) : null}
      </DropdownMenu.Item>
    );
  },
);

ButtonGroupMenuItem.displayName = "ButtonGroupMenuItem";

export function ButtonGroupMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Separator>) {
  return (
    <DropdownMenu.Separator
      className={cn("my-1 h-px bg-[var(--border-strong)]", className)}
      {...props}
    />
  );
}

export function ButtonGroupMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Label>) {
  return (
    <DropdownMenu.Label
      className={cn(
        "px-2.5 py-1.5 text-[11px] font-medium uppercase text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
