"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { IconX } from "@tabler/icons-react";
import {
  cn,
  overlayBackdropClass,
  overlayBackdropEnterTransition,
  overlayBackdropTransition,
  overlayDrawerEnterTransition,
  overlayDrawerEase,
  overlayFullscreenEnterTransition,
  overlayFullscreenTransition,
  overlayInstantTransition,
  overlayMotionEase,
  overlayPanelEnterSpringTransition,
  overlayPanelSpringTransition,
  overlayReducedMotionTransition,
  overlayVerticalPanelClass,
  OverlayOpenProvider,
  useOverlayBodyScrollLock,
  useOverlayCenterOffsetX,
  useOverlayEnterAnimation,
  useOverlayModal,
  useOverlayPortalContainer,
  useOverlayPortalLocalModal,
  useOverlayPresence,
} from "@/components/wensity/overlay";

export type DrawerSide = "bottom" | "top" | "left" | "right" | "fullscreen";

const wensityOverlaySurfaceSkinClass = cn(
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)]",
  "border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--background)_76%,var(--foreground)_10%)]",
  "dark:border-[color-mix(in_srgb,var(--foreground)_9%,transparent)] dark:ring-[color-mix(in_srgb,var(--foreground)_7%,transparent)]",
  "[box-shadow:0_1px_2px_rgba(0,0,0,.08),0_18px_60px_-36px_rgba(0,0,0,.5)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.42),0_24px_80px_-42px_rgba(0,0,0,.82)]",
);

type DrawerContextValue = {
  open: boolean;
  side: DrawerSide;
  snapPoints?: number[];
  activeSnap: number;
  setActiveSnap: React.Dispatch<React.SetStateAction<number>>;
  dismiss: () => void;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer components must be used within Drawer");
  return ctx;
}

const VERTICAL_PANEL_MAX = "26rem";
const DISMISS_DRAG_PX = 120;
const SNAP_SWIPE_PX = 56;
/** Fixed bottom-drawer height when using horizontal snap panels. */
const SNAP_PANEL_HEIGHT = 0.62;

export interface DrawerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
    "children"
  > {
  side?: DrawerSide;
  /** Number of horizontal snap panels (array length). Bottom drawer only. */
  snapPoints?: number[];
  /** Initial snap index when opening. Defaults to 0. */
  defaultSnap?: number;
  children: React.ReactNode;
}

export function Drawer({
  side = "bottom",
  snapPoints,
  defaultSnap = 0,
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  modal: modalProp,
  ...props
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const [activeSnap, setActiveSnap] = React.useState(defaultSnap);
  const scopedLocalModal = useOverlayPortalLocalModal();

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const modal = modalProp ?? true;
  const radixModal =
    scopedLocalModal && modalProp === undefined ? false : modal;
  useOverlayBodyScrollLock(open && modal);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const dismiss = React.useCallback(() => setOpen(false), [setOpen]);

  React.useEffect(() => {
    if (open) setActiveSnap(defaultSnap);
  }, [open, defaultSnap]);

  const context = React.useMemo(
    () => ({
      open,
      side,
      snapPoints,
      activeSnap,
      setActiveSnap,
      dismiss,
    }),
    [open, side, snapPoints, activeSnap, dismiss],
  );

  return (
    <OverlayOpenProvider open={open} modal={modal}>
      <DrawerContext.Provider value={context}>
        <DialogPrimitive.Root
          open={open}
          onOpenChange={setOpen}
          modal={radixModal}
          {...props}
        >
          {children}
        </DialogPrimitive.Root>
      </DrawerContext.Provider>
    </OverlayOpenProvider>
  );
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerSnapPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerSnapPanel({ children, className }: DrawerSnapPanelProps) {
  return (
    <div data-drawer-snap-panel="" className={cn("min-w-full shrink-0", className)}>
      {children}
    </div>
  );
}

function collectSnapPanels(children: React.ReactNode): React.ReactNode[] {
  const panels: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === DrawerSnapPanel) {
      panels.push(child);
    }
  });

  return panels;
}

export interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  container?: React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Portal
  >["container"];
  showHandle?: boolean;
  showClose?: boolean;
}

const drawerBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const fullscreenDrawerMotion = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.985 },
};

const drawerSurfaceClass = cn(
  wensityOverlaySurfaceSkinClass,
  "isolate overflow-hidden",
);

const drawerScrollBodyClass = cn(
  "min-h-0 overflow-y-auto overscroll-y-none touch-pan-y select-none",
  "[&_input]:select-text [&_textarea]:select-text [&_[contenteditable=true]]:select-text",
);

function useDrawerScrollChainLock() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const scrollRoot = ref.current;

    function onWheel(event: WheelEvent) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRoot;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY > 0)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    let lastTouchY = 0;

    function onTouchStart(event: TouchEvent) {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    }

    function onTouchMove(event: TouchEvent) {
      const currentY = event.touches[0]?.clientY ?? lastTouchY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;

      const { scrollTop, scrollHeight, clientHeight } = scrollRoot;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    scrollRoot.addEventListener("wheel", onWheel, { passive: false });
    scrollRoot.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollRoot.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      scrollRoot.removeEventListener("wheel", onWheel);
      scrollRoot.removeEventListener("touchstart", onTouchStart);
      scrollRoot.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return ref;
}

function DrawerScrollBody({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useDrawerScrollChainLock();

  return (
    <div
      ref={ref}
      data-drawer-scroll-body=""
      style={style}
      className={cn(drawerScrollBodyClass, className)}
    >
      {children}
    </div>
  );
}

function clearTextSelection() {
  if (typeof window === "undefined") return;
  window.getSelection()?.removeAllRanges();
}

export function DrawerContent({
  children,
  className,
  title,
  description,
  container,
  showHandle = true,
  showClose = true,
}: DrawerContentProps) {
  const { open, side, snapPoints, activeSnap, setActiveSnap, dismiss } =
    useDrawerContext();
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const modal = useOverlayModal();
  const scopedContainer = useOverlayPortalContainer();
  const portalContainer = container ?? scopedContainer ?? undefined;
  const centerOffsetX = useOverlayCenterOffsetX();
  const centeredDrawerX = `calc(-50% + ${centerOffsetX})`;

  const isFullscreen = side === "fullscreen";
  const isBottom = side === "bottom";
  const isTop = side === "top";
  const isVertical = isBottom || isTop;
  const isHorizontal = side === "left" || side === "right";
  const snapCount = snapPoints?.length ?? 0;
  const hasSnapPanels = snapCount > 0 && isBottom;
  const snapPanels = React.useMemo(() => collectSnapPanels(children), [children]);
  const snapFraction = hasSnapPanels
    ? SNAP_PANEL_HEIGHT
    : snapPoints?.[activeSnap] ?? (isFullscreen ? 1 : 0.55);

  const snapSlideTransition = reduceMotion
    ? overlayReducedMotionTransition
    : { duration: 0.28, ease: overlayMotionEase };

  const resolvedSnapPanels = React.useMemo(() => {
    if (!hasSnapPanels) return null;
    if (snapPanels.length >= snapCount) {
      return snapPanels.slice(0, snapCount);
    }
    return Array.from({ length: snapCount }, (_, index) => {
      return snapPanels[index] ?? snapPanels[0] ?? children;
    });
  }, [children, hasSnapPanels, snapCount, snapPanels]);

  const { present, onExitComplete } = useOverlayPresence(open);
  const entered = useOverlayEnterAnimation(open, present);
  const reducedVerticalDrawerMotion = React.useMemo(
    () => ({
      initial: { opacity: 0, x: centeredDrawerX },
      animate: { opacity: 1, x: centeredDrawerX },
      exit: { opacity: 0, x: centeredDrawerX },
    }),
    [centeredDrawerX],
  );
  const drawerPanelMotion = React.useMemo(
    () => ({
      bottom: {
        initial: { y: "105%", x: centeredDrawerX },
        animate: { y: 0, x: centeredDrawerX },
        exit: { y: "105%", x: centeredDrawerX },
      },
      top: {
        initial: { y: "-105%", x: centeredDrawerX },
        animate: { y: 0, x: centeredDrawerX },
        exit: { y: "-105%", x: centeredDrawerX },
      },
      left: {
        initial: { x: "-100%" },
        animate: { x: 0 },
        exit: { x: "-100%" },
      },
      right: {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
      },
    }),
    [centeredDrawerX],
  );

  const panelTransition = reduceMotion
    ? overlayReducedMotionTransition
    : isFullscreen
      ? open && entered
        ? overlayFullscreenEnterTransition
        : open
          ? overlayInstantTransition
          : overlayFullscreenTransition
      : isVertical
        ? open && entered
          ? overlayPanelEnterSpringTransition
          : open
            ? overlayInstantTransition
            : overlayPanelSpringTransition
        : open && entered
          ? overlayDrawerEnterTransition
          : open
            ? overlayInstantTransition
            : { duration: 0.26, ease: overlayDrawerEase };

  const panelMotion = reduceMotion
    ? isVertical
      ? reducedVerticalDrawerMotion
      : drawerBackdropMotion
    : isFullscreen
      ? fullscreenDrawerMotion
      : drawerPanelMotion[side];
  const panelTarget = open
    ? entered
      ? panelMotion.animate
      : panelMotion.initial
    : panelMotion.exit;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (isBottom) {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 600 || offset > DISMISS_DRAG_PX) {
        dismiss();
      }

      clearTextSelection();
      return;
    }

    if (isTop) {
      const velocity = info.velocity.y;
      const offset = info.offset.y;
      if (velocity < -600 || offset < -DISMISS_DRAG_PX) {
        dismiss();
        return;
      }
      return;
    }

    if (!isHorizontal) return;

    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (
      (side === "right" && (velocity > 600 || offset > DISMISS_DRAG_PX)) ||
      (side === "left" && (velocity < -600 || offset < -DISMISS_DRAG_PX))
    ) {
      dismiss();
      return;
    }
  }

  function onSnapCarouselDragEnd(_: unknown, info: PanInfo) {
    if (!hasSnapPanels || snapCount <= 1) return;

    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (velocity < -500 || offset < -SNAP_SWIPE_PX) {
      setActiveSnap((current) => Math.min(snapCount - 1, current + 1));
    } else if (velocity > 500 || offset > SNAP_SWIPE_PX) {
      setActiveSnap((current) => Math.max(0, current - 1));
    }

    clearTextSelection();
  }

  const snapTrackX = snapCount > 0 ? `-${(activeSnap * 100) / snapCount}%` : "0%";

  React.useEffect(() => {
    if (!open || !hasSnapPanels || snapCount <= 1) return;

    function isEditableTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return Boolean(target.closest("[contenteditable='true']"));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveSnap((current) => Math.max(0, current - 1));
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveSnap((current) => Math.min(snapCount - 1, current + 1));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hasSnapPanels, snapCount, setActiveSnap]);

  if (!present) return null;

  const verticalPanelStyle = isVertical
    ? isBottom
      ? {
          height: `min(${snapFraction * 100}vh, ${VERTICAL_PANEL_MAX})`,
          maxHeight: `min(72vh, ${VERTICAL_PANEL_MAX})`,
        }
      : {
          maxHeight: `min(72vh, ${VERTICAL_PANEL_MAX})`,
        }
    : undefined;
  const backdropEnterTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropEnterTransition;
  const backdropExitTransition = reduceMotion
    ? overlayReducedMotionTransition
    : overlayBackdropTransition;

  return (
    <DialogPrimitive.Portal forceMount container={portalContainer}>
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
                key="drawer-backdrop"
                className={overlayBackdropClass}
                initial={false}
                animate={
                  entered
                    ? {
                        ...drawerBackdropMotion.animate,
                        transition: backdropEnterTransition,
                      }
                    : {
                        ...drawerBackdropMotion.initial,
                        transition: overlayInstantTransition,
                      }
                }
                exit={{
                  ...drawerBackdropMotion.exit,
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
                key="drawer-backdrop"
                className={cn(overlayBackdropClass, "pointer-events-none")}
                initial={false}
                animate={
                  entered
                    ? {
                        ...drawerBackdropMotion.animate,
                        transition: backdropEnterTransition,
                      }
                    : {
                        ...drawerBackdropMotion.initial,
                        transition: overlayInstantTransition,
                      }
                }
                exit={{
                  ...drawerBackdropMotion.exit,
                  transition: backdropExitTransition,
                }}
              />
            ) : null}
          </AnimatePresence>
        </div>
      )}

      <DialogPrimitive.Content forceMount asChild>
        <motion.div
          drag={isBottom ? "y" : isTop ? "y" : isHorizontal ? "x" : false}
          dragControls={dragControls}
          dragListener={isHorizontal}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragElastic={
            isBottom
              ? { top: 0, bottom: 0.08 }
              : isTop
                ? { top: 0.08, bottom: 0 }
                : 0.12
          }
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={
            isFullscreen
              ? undefined
              : isHorizontal
                ? {
                    width: "min(100vw, 22rem)",
                  }
                : verticalPanelStyle
          }
          className={cn(
            "pointer-events-auto fixed z-[101] flex transform-gpu flex-col border-0 bg-transparent p-0 shadow-none focus:outline-none will-change-transform",
            drawerSurfaceClass,
            isVertical && overlayVerticalPanelClass,
            isBottom && "bottom-4 border-b-0",
            isTop && "top-4 border-t-0",
            side === "left" &&
              "inset-y-0 left-0 h-full w-[min(100vw,22rem)] rounded-r-2xl border-l-0",
            side === "right" &&
              "inset-y-0 right-0 h-full w-[min(100vw,22rem)] rounded-l-2xl border-r-0",
            side === "fullscreen" &&
              "inset-3 rounded-xl sm:inset-4 sm:rounded-2xl md:inset-6",
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
          <DialogPrimitive.Title className="sr-only">
            {title ?? "Drawer"}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="sr-only">
              {description}
            </DialogPrimitive.Description>
          ) : null}

          {isBottom && showHandle ? (
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pb-2 pt-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="h-1.5 w-10 rounded-full bg-[color-mix(in_srgb,var(--foreground)_22%,transparent)]" />
            </div>
          ) : null}

          {(title || description) && (
            <div
              aria-hidden
              className={cn(
                "shrink-0 select-none border-[var(--border)]",
                isFullscreen
                  ? "border-b px-5 py-4 pr-14 sm:px-8 sm:py-5"
                  : cn(
                      "px-5 pb-4 pr-12",
                      isBottom && showHandle ? "border-b pt-0" : "border-b pt-1",
                      isTop && "border-b pt-1",
                      isHorizontal && "border-b pt-1",
                    ),
              )}
            >
              {title ? (
                <p
                  className={cn(
                    "font-semibold tracking-[-0.015em] text-[var(--foreground)]",
                    isFullscreen ? "text-lg sm:text-xl" : "text-base",
                  )}
                >
                  {title}
                </p>
              ) : null}
              {description ? (
                <p
                  className={cn(
                    "text-[var(--muted-foreground)]",
                    isFullscreen
                      ? "mt-1.5 text-sm leading-relaxed"
                      : "mt-1 text-[13px]",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
          )}

          {isTop && showHandle ? (
            <DrawerScrollBody className="min-h-0 flex-1 px-5 pt-4 pb-2">
              {children}
            </DrawerScrollBody>
          ) : isFullscreen ? (
            <DrawerScrollBody className="flex min-h-0 flex-1 flex-col">
              <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8">
                {children}
              </div>
            </DrawerScrollBody>
          ) : hasSnapPanels && resolvedSnapPanels ? (
            <div
              className="min-h-0 flex-1 overflow-hidden select-none overscroll-y-none"
              role="group"
              aria-label={`Panel ${activeSnap + 1} of ${snapCount}`}
              aria-live="polite"
            >
              <motion.div
                className="flex h-full touch-pan-x select-none"
                style={{ width: `${snapCount * 100}%` }}
                drag={snapCount > 1 ? "x" : false}
                dragDirectionLock
                dragElastic={0.08}
                dragMomentum={false}
                onDragStart={clearTextSelection}
                onDragEnd={onSnapCarouselDragEnd}
                animate={{ x: snapTrackX }}
                transition={snapSlideTransition}
              >
                {resolvedSnapPanels.map((panel, index) => (
                  <DrawerScrollBody
                    key={index}
                    className="h-full min-h-0 shrink-0 px-5 py-4"
                    style={{ width: `${100 / snapCount}%` }}
                  >
                    {panel}
                  </DrawerScrollBody>
                ))}
              </motion.div>
            </div>
          ) : (
            <DrawerScrollBody className="min-h-0 flex-1 px-5 py-4">
              {children}
            </DrawerScrollBody>
          )}

          {isTop && showHandle ? (
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center px-4 pb-3 pt-2 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="h-1.5 w-10 rounded-full bg-[color-mix(in_srgb,var(--foreground)_22%,transparent)]" />
            </div>
          ) : null}

          {snapPoints?.length && isBottom ? (
            <div className="flex shrink-0 justify-center gap-1.5 border-t border-[var(--border)] px-5 py-3">
              {snapPoints.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to panel ${index + 1} of ${snapPoints.length}`}
                  aria-current={activeSnap === index ? "step" : undefined}
                  onClick={() => setActiveSnap(index)}
                  className="relative flex h-1.5 w-6 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--foreground)_22%,transparent)]",
                      "transition-opacity duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                      activeSnap === index && "opacity-0",
                    )}
                  />
                  {activeSnap === index ? (
                    <motion.span
                      layoutId="drawer-snap-indicator"
                      className="absolute inset-y-0 left-0 w-6 rounded-full bg-[var(--foreground)]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.22, ease: overlayMotionEase }
                      }
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {showClose ? (
            <DialogPrimitive.Close
              className={cn(
                "absolute inline-flex size-8 items-center justify-center rounded-lg",
                isFullscreen ? "right-4 top-4 sm:right-5 sm:top-5" : "right-3 top-3",
                "text-[var(--muted-foreground)] transition-colors duration-160",
                "hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] hover:text-[var(--foreground)]",
              )}
              aria-label="Close drawer"
            >
              <IconX stroke={1.75} className="size-4" />
            </DialogPrimitive.Close>
          ) : null}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
