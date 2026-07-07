"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import {
  cn,
  overlayBackdropClass,
  overlayBackdropEnterTransition,
  overlayBackdropTransition,
  overlayDialogEnterTransition,
  overlayDialogTransition,
  overlayFullscreenEnterTransition,
  overlayFullscreenTransition,
  overlayInstantTransition,
  OverlayOpenProvider,
  overlayReducedMotionTransition,
  useControllableOverlayOpen,
  useOverlayBodyScrollLock,
  useOverlayCenterOffsetX,
  useOverlayEnterAnimation,
  useOverlayModal,
  useOverlayOpen,
  useOverlayPortalContainer,
  useOverlayPortalLocalModal,
  useOverlayPresence,
} from "@/components/wensity/overlay";

const wensityOverlaySurfaceSkinClass = cn(
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)]",
  "border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--background)_76%,var(--foreground)_10%)]",
  "dark:border-[color-mix(in_srgb,var(--foreground)_9%,transparent)] dark:ring-[color-mix(in_srgb,var(--foreground)_7%,transparent)]",
  "[box-shadow:0_1px_2px_rgba(0,0,0,.08),0_18px_60px_-36px_rgba(0,0,0,.5)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.42),0_24px_80px_-42px_rgba(0,0,0,.82)]",
);

const overlaySurfaceClass = cn(
  wensityOverlaySurfaceSkinClass,
  "isolate overflow-hidden rounded-2xl",
);

const fullscreenDialogMotion = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.985 },
};

const reducedDialogMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function hasDialogTitle(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === DialogTitle || child.type === DialogPrimitive.Title) {
      return true;
    }

    return hasDialogTitle(
      (child.props as { children?: React.ReactNode }).children,
    );
  });
}

export type DialogVariant =
  | "default"
  | "confirmation"
  | "form"
  | "fullscreen"
  | "scrollable";

export interface DialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

export function Dialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  modal: modalProp,
  ...props
}: DialogProps) {
  const { open, setOpen } = useControllableOverlayOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  const scopedLocalModal = useOverlayPortalLocalModal();
  const modal = modalProp ?? true;
  const radixModal =
    scopedLocalModal && modalProp === undefined ? false : modal;
  useOverlayBodyScrollLock(open && modal);

  return (
    <OverlayOpenProvider open={open} modal={modal}>
      <DialogPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        modal={radixModal}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </OverlayOpenProvider>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const open = useOverlayOpen();
  const reduceMotion = useReducedMotion();
  const { present, onExitComplete } = useOverlayPresence(open);
  const entered = useOverlayEnterAnimation(open, present);
  const enterTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropEnterTransition;
  const exitTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropTransition;

  if (!present) return null;

  return (
    <DialogPrimitive.Overlay
      forceMount
      className={cn(
        "fixed inset-0 z-[100] border-0 bg-transparent p-0",
        !open && "pointer-events-none",
        className,
      )}
      {...props}
    >
      <AnimatePresence onExitComplete={onExitComplete}>
        {open ? (
          <motion.div
            key="dialog-overlay"
            className={overlayBackdropClass}
            initial={false}
            animate={
              entered
                ? { ...backdropMotion.animate, transition: enterTransition }
                : {
                    ...backdropMotion.initial,
                    transition: overlayInstantTransition,
                  }
            }
            exit={{ ...backdropMotion.exit, transition: exitTransition }}
          />
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Overlay>
  );
}

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: DialogVariant;
  showClose?: boolean;
  container?: React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Portal
  >["container"];
  /** Screen-reader label kept mounted while exit animations run. */
  accessibilityTitle?: string;
}

const contentVariants: Record<DialogVariant, string> = {
  default: "fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] max-w-[480px]",
  confirmation:
    "fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] max-w-[420px]",
  form: "fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] max-w-[540px]",
  fullscreen: "fixed inset-3 z-[101] flex flex-col sm:inset-4 md:inset-6",
  scrollable:
    "fixed left-1/2 top-1/2 z-[101] flex max-h-[min(88vh,720px)] w-[calc(100vw-2rem)] max-w-[520px] flex-col",
};

export function DialogContent({
  className,
  children,
  variant = "default",
  showClose = true,
  container,
  accessibilityTitle = "Dialog",
  ...props
}: DialogContentProps) {
  const open = useOverlayOpen();
  const modal = useOverlayModal();
  const reduceMotion = useReducedMotion();
  const scopedContainer = useOverlayPortalContainer();
  const portalContainer = container ?? scopedContainer ?? undefined;
  const isFullscreen = variant === "fullscreen";
  const isScrollable = variant === "scrollable";
  const isCentered = !isFullscreen;
  const hasProvidedTitle = hasDialogTitle(children);
  const centerOffsetX = useOverlayCenterOffsetX();
  const centeredDialogX = `calc(-50% + ${centerOffsetX})`;
  const centeredDialogMotion = React.useMemo(
    () => ({
      initial: { opacity: 0, scale: 0.965, x: centeredDialogX, y: "-50%" },
      animate: { opacity: 1, scale: 1, x: centeredDialogX, y: "-50%" },
      exit: { opacity: 0, scale: 0.965, x: centeredDialogX, y: "-50%" },
    }),
    [centeredDialogX],
  );
  const reducedCenteredDialogMotion = React.useMemo(
    () => ({
      initial: { opacity: 0, x: centeredDialogX, y: "-50%" },
      animate: { opacity: 1, x: centeredDialogX, y: "-50%" },
      exit: { opacity: 0, x: centeredDialogX, y: "-50%" },
    }),
    [centeredDialogX],
  );

  const panelMotion = reduceMotion
    ? isCentered
      ? reducedCenteredDialogMotion
      : reducedDialogMotion
    : isCentered
      ? centeredDialogMotion
      : fullscreenDialogMotion;

  const { present, onExitComplete } = useOverlayPresence(open);
  const entered = useOverlayEnterAnimation(open, present);

  const panelTransition = reduceMotion
    ? overlayReducedMotionTransition
    : open && entered
      ? isFullscreen
        ? overlayFullscreenEnterTransition
        : overlayDialogEnterTransition
      : open
        ? overlayInstantTransition
        : isFullscreen
          ? overlayFullscreenTransition
          : overlayDialogTransition;

  const panelTarget = open
    ? entered
      ? panelMotion.animate
      : panelMotion.initial
    : panelMotion.exit;

  const backdropEnterTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropEnterTransition;
  const backdropExitTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropTransition;

  if (!present) return null;

  return (
    <DialogPortal forceMount container={portalContainer}>
      {modal ? (
        <DialogPrimitive.Overlay
          forceMount
          className={cn(
            "fixed inset-0 z-[100] border-0 bg-transparent p-0",
            !open && "pointer-events-none",
          )}
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                key="dialog-backdrop"
                className={overlayBackdropClass}
                initial={false}
                animate={
                  entered
                    ? {
                        ...backdropMotion.animate,
                        transition: backdropEnterTransition,
                      }
                    : {
                        ...backdropMotion.initial,
                        transition: overlayInstantTransition,
                      }
                }
                exit={{
                  ...backdropMotion.exit,
                  transition: backdropExitTransition,
                }}
              />
            ) : null}
          </AnimatePresence>
        </DialogPrimitive.Overlay>
      ) : (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none fixed inset-0 z-[100] border-0 bg-transparent p-0",
          )}
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                key="dialog-backdrop"
                className={cn(overlayBackdropClass, "pointer-events-none")}
                initial={false}
                animate={
                  entered
                    ? {
                        ...backdropMotion.animate,
                        transition: backdropEnterTransition,
                      }
                    : {
                        ...backdropMotion.initial,
                        transition: overlayInstantTransition,
                      }
                }
                exit={{
                  ...backdropMotion.exit,
                  transition: backdropExitTransition,
                }}
              />
            ) : null}
          </AnimatePresence>
        </div>
      )}

      <DialogPrimitive.Content forceMount asChild {...props}>
        <motion.div
          className={cn(
            contentVariants[variant],
            "pointer-events-auto transform-gpu border-0 bg-transparent p-0 shadow-none focus:outline-none will-change-transform",
            overlaySurfaceClass,
            isFullscreen && "rounded-xl sm:rounded-2xl",
            isScrollable && "flex min-h-0 flex-col overflow-hidden",
            !open && "pointer-events-none",
            className,
          )}
          initial={false}
          animate={panelTarget}
          transition={panelTransition}
          onAnimationComplete={() => {
            if (!open) onExitComplete();
          }}
        >
          {hasProvidedTitle ? null : (
            <DialogPrimitive.Title className="sr-only">
              {accessibilityTitle}
            </DialogPrimitive.Title>
          )}
          <div
            className={cn(
              isScrollable && "flex min-h-0 flex-1 flex-col",
              !isScrollable && "relative",
            )}
          >
            {children}
            {showClose ? (
              <DialogPrimitive.Close
                className={cn(
                  "absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-lg",
                  "border border-transparent text-[var(--muted-foreground)]",
                  "transition-[background-color,border-color,color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  "hover:border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] hover:text-[var(--foreground)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)]",
                )}
                aria-label="Close"
              >
                <IconX stroke={1.75} className="size-4" />
              </DialogPrimitive.Close>
            ) : null}
          </div>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b border-[var(--border)] px-5 py-4 sm:px-6 sm:py-5",
        className,
      )}
      {...props}
    />
  );
}

export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4 sm:px-6 sm:py-5", className)} {...props} />
  );
}

export function DialogScrollBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5",
        className,
      )}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "pr-8 text-base font-semibold tracking-[-0.015em] text-[var(--foreground)] sm:text-[17px]",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "mt-1.5 text-[13px] leading-[1.55] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export interface DialogConfirmationProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  container?: React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Portal
  >["container"];
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  destructive?: boolean;
}

export function DialogConfirmation({
  open,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  container,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
}: DialogConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        variant="confirmation"
        showClose={false}
        container={container}
        accessibilityTitle={
          typeof title === "string" ? title : "Confirm action"
        }
      >
        <DialogBody className="pt-6 text-center sm:pt-7">
          {icon ? (
            <div
              className={cn(
                "mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border",
                destructive
                  ? "border-red-500/25 bg-red-500/10 text-red-400"
                  : "border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] text-[var(--foreground)]",
              )}
            >
              {icon}
            </div>
          ) : null}
          <DialogTitle className="pr-0 text-center">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="mx-auto mt-2 max-w-[30ch] text-center">
              {description}
            </DialogDescription>
          ) : null}
        </DialogBody>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-center">
          <DialogClose asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium",
                "text-[var(--foreground)] transition-[background-color,border-color] duration-160",
                "hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))]",
              )}
            >
              {cancelLabel}
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-white",
                "transition-[background-color,border-color] duration-160",
                destructive
                  ? "border border-red-500/70 bg-red-600 hover:bg-red-500"
                  : "border border-[#31383d] bg-[#24292d] hover:bg-[#2c3237] dark:border-white/18 dark:bg-[#f5f3ee] dark:text-[#151719]",
              )}
            >
              {confirmLabel}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
