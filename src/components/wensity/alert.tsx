"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleX,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "error";
export type AlertDensity = "comfortable" | "compact";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  density?: AlertDensity;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const variantStyles: Record<
  AlertVariant,
  {
    root: string;
    icon: string;
    iconNode: React.ReactNode;
  }
> = {
  neutral: {
    root: cn(
      "border-[#ded3c5] bg-[#f7f2e9] text-[#181716]",
      "dark:border-white/[0.08] dark:bg-[#111111] dark:text-white",
    ),
    icon: "text-[#5f5a52] dark:text-zinc-300",
    iconNode: <IconInfoCircle stroke={1.9} />,
  },
  info: {
    root: cn(
      "border-[#ded3c5] bg-[rgba(240,249,255,0.72)] text-slate-950 backdrop-blur-md",
      "dark:border-white/[0.08] dark:bg-[rgba(14,165,233,0.10)] dark:text-white",
    ),
    icon: "text-sky-600 dark:text-sky-300",
    iconNode: <IconInfoCircle stroke={1.9} />,
  },
  success: {
    root: cn(
      "border-[#ded3c5] bg-[#f7f2e9] text-[#181716]",
      "dark:border-white/[0.08] dark:bg-[#111111] dark:text-white",
    ),
    icon: "text-emerald-600 dark:text-emerald-300",
    iconNode: <IconCheck stroke={2.1} />,
  },
  warning: {
    root: cn(
      "border-[#ded3c5] bg-[#f7f2e9] text-[#181716]",
      "dark:border-white/[0.08] dark:bg-[#111111] dark:text-white",
    ),
    icon: "text-amber-600 dark:text-amber-300",
    iconNode: <IconAlertTriangle stroke={1.9} />,
  },
  error: {
    root: cn(
      "border-[#ded3c5] bg-[rgba(254,242,242,0.76)] text-slate-950 backdrop-blur-md",
      "dark:border-white/[0.08] dark:bg-[rgba(239,68,68,0.11)] dark:text-white",
    ),
    icon: "text-red-600 dark:text-red-300",
    iconNode: <IconCircleX stroke={1.9} />,
  },
};

const densityStyles: Record<AlertDensity, string> = {
  comfortable: "gap-3 px-3.5 py-3",
  compact: "gap-2.5 px-3 py-2.5",
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      density = "comfortable",
      title,
      description,
      icon,
      action,
      onDismiss,
      dismissLabel = "Dismiss alert",
      children,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      ensureAlertStyles();
    }, []);

    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        role={variant === "error" ? "alert" : "status"}
        data-slot="alert"
        data-variant={variant}
        className={cn(
          "wensity-alert relative isolate flex overflow-hidden rounded-xl border",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-22px_rgba(0,0,0,0.22)]",
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.30),0_14px_30px_-24px_rgba(0,0,0,0.74)]",
          densityStyles[density],
          styles.root,
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center opacity-95 [&_svg]:size-[18px]",
            styles.icon,
          )}
        >
          {icon ?? styles.iconNode}
        </span>
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
            {title ? <AlertTitle>{title}</AlertTitle> : null}
            {description ? <AlertDescription>{description}</AlertDescription> : null}
            {children}
          </div>
        </div>
        {action ? <div className="ml-2 flex shrink-0 items-center self-center">{action}</div> : null}
        {onDismiss ? (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className={cn(
              "-mr-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-500",
              "transition-[background,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/15",
              "dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-white dark:focus-visible:ring-white/18",
            )}
          >
            <IconX aria-hidden="true" className="size-4" stroke={1.9} />
          </button>
        ) : null}
      </div>
    );
  },
);
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn("text-[13px] font-semibold leading-5 tracking-[-0.01em] text-slate-950 dark:text-white", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn("text-[12.5px] leading-5 text-slate-600 dark:text-zinc-400", className)}
      {...props}
    />
  ),
);
AlertDescription.displayName = "AlertDescription";

function ensureAlertStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("wensity-alert-styles")) return;

  const style = document.createElement("style");
  style.id = "wensity-alert-styles";
  style.textContent = `
@media (prefers-reduced-motion: no-preference) {
  .wensity-alert {
    animation: wensity-alert-enter 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

@keyframes wensity-alert-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
  document.head.appendChild(style);
}
