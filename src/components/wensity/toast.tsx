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

export type ToastVariant = "info" | "success" | "warning" | "error" | "action";
export type ToastPlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  placement?: ToastPlacement;
}

const variantStyles: Record<
  ToastVariant,
  {
    root: string;
    icon: string;
    iconNode: React.ReactNode;
  }
> = {
  info: {
    root: cn(
      "border-[#ded3c5] bg-[#eef8ff] text-slate-950",
      "dark:border-white/[0.08] dark:bg-[#101820] dark:text-white",
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
      "border-[#ded3c5] bg-[#fff0f0] text-slate-950",
      "dark:border-white/[0.08] dark:bg-[#1c1111] dark:text-white",
    ),
    icon: "text-red-600 dark:text-red-300",
    iconNode: <IconCircleX stroke={1.9} />,
  },
  action: {
    root: cn(
      "border-[#ded3c5] bg-[#f7f2e9] text-[#181716]",
      "dark:border-white/[0.08] dark:bg-[#111111] dark:text-white",
    ),
    icon: "text-[#5f5a52] dark:text-zinc-300",
    iconNode: <IconInfoCircle stroke={1.9} />,
  },
};

const placementClasses: Record<ToastPlacement, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "right-4 bottom-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = "info",
      title,
      description,
      icon,
      action,
      onDismiss,
      dismissLabel = "Dismiss notification",
      children,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      ensureToastStyles();
    }, []);

    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        role={variant === "error" ? "alert" : "status"}
        data-slot="toast"
        data-variant={variant}
        className={cn(
          "wensity-toast relative isolate flex w-full max-w-sm gap-3 overflow-hidden rounded-xl border",
          "px-3.5 py-3",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-22px_rgba(0,0,0,0.22)]",
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.30),0_14px_30px_-24px_rgba(0,0,0,0.74)]",
          styles.root,
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center opacity-95 [&_svg]:size-[18px]", styles.icon)}
        >
          {icon ?? styles.iconNode}
        </span>
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
            {title ? (
              <div className="text-[13px] font-semibold leading-5 tracking-[-0.01em] text-slate-950 dark:text-white">
                {title}
              </div>
            ) : null}
            {description ? (
              <div className="text-[12.5px] leading-5 text-slate-600 dark:text-zinc-400">
                {description}
              </div>
            ) : null}
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
              "transition-[background,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:bg-slate-100 hover:text-slate-950",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/15",
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
Toast.displayName = "Toast";

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, placement = "top-right", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed z-50 flex w-[min(calc(100vw-2rem),24rem)] flex-col gap-2",
        placementClasses[placement],
        "[&>[data-slot=toast]]:pointer-events-auto",
        className,
      )}
      {...props}
    />
  ),
);
ToastViewport.displayName = "ToastViewport";

function ensureToastStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("wensity-toast-styles")) return;

  const style = document.createElement("style");
  style.id = "wensity-toast-styles";
  style.textContent = `
@media (prefers-reduced-motion: no-preference) {
  .wensity-toast {
    animation: wensity-toast-enter 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

@keyframes wensity-toast-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
  document.head.appendChild(style);
}
