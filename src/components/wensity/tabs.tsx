"use client";

import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */

export type TabsVariant =
  | "default"
  | "underline"
  | "pills"
  | "segmented"
  | "vertical";

export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  variant?: TabsVariant;
  size?: TabsSize;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TabsTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

/* ─── Context ───────────────────────────────────────────────── */

type TabsContextValue = {
  activeValue: string;
  setActiveValue: (v: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  layoutId: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs compound components must be used within <Tabs>");
  return ctx;
}

/* ─── Easing & Spring ───────────────────────────────────────── */

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const indicatorSpring = {
  type: "spring" as const,
  duration: 0.28,
  bounce: 0.08,
};

const contentFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: EASE_OUT },
};

/* ─── Size Maps ─────────────────────────────────────────────── */

const triggerSizes: Record<TabsSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 [&_svg]:size-3",
  md: "h-8 px-3 text-sm gap-2 [&_svg]:size-3.5",
  lg: "h-9 px-3.5 text-[15px] gap-2 [&_svg]:size-4",
};

const listGaps: Record<TabsSize, string> = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1",
};

/* ─── Variant-specific list styles ──────────────────────────── */

const listVariantClasses: Record<TabsVariant, string> = {
  default: "",
  underline: cn(
    "border-b border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
    "dark:border-white/[0.08]",
  ),
  pills: "",
  segmented: cn(
    "rounded-xl p-1",
    "bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
    "border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
    "dark:bg-[#0c0c0e] dark:border-white/[0.04]",
  ),
  vertical: cn(
    "flex-col items-stretch",
    "border-l border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
    "dark:border-white/[0.08]",
    "pl-0",
  ),
};

/* ─── Trigger base & variant ────────────────────────────────── */

const triggerBase = cn(
  "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap",
  "font-medium leading-none tracking-[-0.01em] select-none touch-manipulation",
  "rounded-lg outline-none cursor-default",
  "transition-[color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  "disabled:pointer-events-none disabled:opacity-45",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

function triggerVariantClasses(
  variant: TabsVariant,
  isActive: boolean,
): string {
  switch (variant) {
    case "default":
      return isActive
        ? "text-[var(--foreground)]"
        : cn(
            "text-[var(--muted-foreground)]",
            "hover:text-[var(--foreground)]",
          );

    case "underline":
      return isActive
        ? "text-[var(--foreground)] rounded-none"
        : cn(
            "text-[var(--muted-foreground)] rounded-none",
          );

    case "pills":
      return isActive
        ? cn(
            "text-[var(--foreground)] rounded-full",
          )
        : cn(
            "text-[var(--muted-foreground)] rounded-full",
          );

    case "segmented":
      return isActive
        ? "text-[var(--foreground)] z-[1]"
        : cn(
            "text-[var(--muted-foreground)] z-[1]",
          );

    case "vertical":
      return isActive
        ? cn(
            "text-[var(--foreground)] justify-start rounded-none",
          )
        : cn(
            "text-[var(--muted-foreground)] justify-start rounded-none",
          );

    default:
      return "";
  }
}

/* ─── Hover class (applied via data-attr for touch safety) ─── */

const hoverClasses: Record<TabsVariant, string> = {
  default:
    "hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))]",
  underline: "hover:text-[var(--foreground)]",
  pills:
    "hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
  segmented: "hover:text-[var(--foreground)]",
  vertical:
    "hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))]",
};

/* ─── <Tabs> ────────────────────────────────────────────────── */

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      variant = "default",
      size = "md",
      value: controlledValue,
      defaultValue,
      onValueChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? "",
    );
    const activeValue =
      controlledValue !== undefined ? controlledValue : internalValue;

    const layoutId = React.useId();

    const setActiveValue = React.useCallback(
      (v: string) => {
        if (controlledValue === undefined) setInternalValue(v);
        onValueChange?.(v);
      },
      [controlledValue, onValueChange],
    );

    const ctx = React.useMemo<TabsContextValue>(
      () => ({ activeValue, setActiveValue, variant, size, layoutId }),
      [activeValue, setActiveValue, variant, size, layoutId],
    );

    return (
      <TabsContext.Provider value={ctx}>
        <div
          ref={ref}
          data-slot="tabs"
          data-variant={variant}
          className={cn(
            variant === "vertical" ? "flex gap-4" : "flex flex-col",
            className,
          )}
          {...props}
        >
          <LayoutGroup id={layoutId}>
            {children}
          </LayoutGroup>
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

/* ─── <TabsList> ────────────────────────────────────────────── */

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, size } = useTabsContext();

    return (
      <div
        ref={ref}
        role="tablist"
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          "inline-flex items-center",
          listGaps[size],
          listVariantClasses[variant],
          variant === "vertical" && "min-w-[140px]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsList.displayName = "TabsList";

/* ─── <TabsTrigger> ─────────────────────────────────────────── */

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ value, disabled, className, children, ...props }, ref) => {
  const { activeValue, setActiveValue, variant, size, layoutId } =
    useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      data-variant={variant}
      aria-selected={isActive}
      aria-controls={`tabpanel-${layoutId}-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveValue(value)}
      onKeyDown={(e) => {
        const triggers = Array.from(
          e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
            '[data-slot="tabs-trigger"]:not([disabled])',
          ) ?? [],
        );
        const isVertical = variant === "vertical";
        const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
        const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
        const idx = triggers.indexOf(e.currentTarget);

        if (e.key === nextKey) {
          e.preventDefault();
          const next = triggers[(idx + 1) % triggers.length];
          next?.focus();
          next && setActiveValue(next.dataset.value ?? "");
        } else if (e.key === prevKey) {
          e.preventDefault();
          const prev =
            triggers[(idx - 1 + triggers.length) % triggers.length];
          prev?.focus();
          prev && setActiveValue(prev.dataset.value ?? "");
        } else if (e.key === "Home") {
          e.preventDefault();
          triggers[0]?.focus();
          triggers[0] && setActiveValue(triggers[0].dataset.value ?? "");
        } else if (e.key === "End") {
          e.preventDefault();
          const last = triggers[triggers.length - 1];
          last?.focus();
          last && setActiveValue(last.dataset.value ?? "");
        }
      }}
      data-value={value}
      className={cn(
        triggerBase,
        triggerSizes[size],
        triggerVariantClasses(variant, isActive),
        !isActive && hoverClasses[variant],
        className,
      )}
      {...props}
    >
      {children}

      {/* ── Default sliding indicator pill ── */}
      {variant === "default" && isActive && (
        <motion.span
          layoutId={`tabs-default-pill-${layoutId}`}
          className={cn(
            "absolute inset-0 rounded-lg",
            "bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))]",
            "border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
            "dark:bg-[color-mix(in_srgb,var(--foreground)_10%,var(--background))]",
            "dark:border-white/[0.04]",
          )}
          transition={indicatorSpring}
          style={{ zIndex: -1 }}
        />
      )}

      {/* ── Underline sliding indicator ── */}
      {variant === "underline" && isActive && (
        <motion.span
          layoutId={`tabs-underline-${layoutId}`}
          className={cn(
            "absolute inset-x-0 -bottom-px h-[2px]",
            "bg-[var(--foreground)]",
            "dark:bg-[var(--foreground)]",
          )}
          transition={indicatorSpring}
          style={{ borderRadius: 1 }}
        />
      )}

      {/* ── Pills background indicator ── */}
      {variant === "pills" && isActive && (
        <motion.span
          layoutId={`tabs-pill-${layoutId}`}
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-[color-mix(in_srgb,var(--foreground)_10%,var(--background))]",
            "border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
            "dark:bg-[color-mix(in_srgb,var(--foreground)_14%,var(--background))]",
            "dark:border-white/[0.08]",
          )}
          transition={indicatorSpring}
          style={{ zIndex: -1 }}
        />
      )}

      {/* ── Segmented sliding backdrop ── */}
      {variant === "segmented" && isActive && (
        <motion.span
          layoutId={`tabs-segment-${layoutId}`}
          className={cn(
            "absolute inset-0 rounded-[10px]",
            "bg-[var(--background)]",
            "border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
            "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
            "dark:bg-[#1a1a1e]",
            "dark:border-white/[0.08]",
            "dark:shadow-[0_2px_8px_rgba(0,0,0,0.48),0_1px_2px_rgba(0,0,0,0.24)]",
          )}
          transition={indicatorSpring}
          style={{ zIndex: -1 }}
        />
      )}

      {/* ── Vertical accent bar ── */}
      {variant === "vertical" && isActive && (
        <motion.span
          layoutId={`tabs-vertical-bar-${layoutId}`}
          className={cn(
            "absolute -left-px top-1 bottom-1 w-[2px] rounded-full",
            "bg-[var(--foreground)]",
            "dark:bg-[var(--foreground)]",
          )}
          transition={indicatorSpring}
        />
      )}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

/* ─── <TabsContent> ─────────────────────────────────────────── */

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeValue, layoutId } = useTabsContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    // Destructure HTML-only event handlers that conflict with Framer Motion's
    // drag types to prevent TS2322 when spreading onto motion.div.
    const {
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      onAnimationStart: _onAnimationStart,
      ...safeProps
    } = props;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          ref={ref}
          role="tabpanel"
          data-slot="tabs-content"
          id={`tabpanel-${layoutId}-${value}`}
          tabIndex={0}
          className={cn(
            "flex-1 outline-none",
            "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)] focus-visible:ring-offset-2",
            className,
          )}
          {...contentFade}
          {...safeProps}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
);
TabsContent.displayName = "TabsContent";
