import * as React from "react";
import { cn } from "@/lib/utils";
export { cn } from "@/lib/utils";

type OverlayEase = [number, number, number, number];

/** Framer-motion compatible transition. Matches `import("framer-motion").Transition`. */
type OverlayTransition = import("framer-motion").Transition;

/** Smooth deceleration — slow settle without bounce. */
export const overlayMotionEase: OverlayEase = [0.16, 1, 0.3, 1];

export const overlayEnterEase: OverlayEase = [0.22, 0, 0.08, 1];

export const overlayBackdropTransition: OverlayTransition = {
  duration: 0.18,
  ease: overlayMotionEase,
};

export const overlayBackdropEnterTransition: OverlayTransition = {
  duration: 0.3,
  ease: overlayEnterEase,
};

export const overlayDialogTransition: OverlayTransition = {
  duration: 0.22,
  ease: overlayMotionEase,
};

export const overlayDialogEnterTransition: OverlayTransition = {
  duration: 0.44,
  ease: overlayEnterEase,
};

export const overlayFullscreenTransition: OverlayTransition = {
  duration: 0.24,
  ease: overlayMotionEase,
};

export const overlayFullscreenEnterTransition: OverlayTransition = {
  duration: 0.46,
  ease: overlayEnterEase,
};

export const overlaySheetTransition: OverlayTransition = {
  duration: 0.26,
  ease: overlayMotionEase,
};

export const overlaySheetEnterTransition: OverlayTransition = {
  duration: 0.52,
  ease: overlayEnterEase,
};

export const overlayBackdropClass = "absolute inset-0 bg-black/60";

/** Spring settle for summoned panels (drawers / vertical sheets). */
export const overlayPanelSpringTransition: OverlayTransition = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
};

export const overlayPanelEnterSpringTransition: OverlayTransition = {
  type: "tween",
  duration: 0.52,
  ease: overlayEnterEase,
};

export const overlayDrawerEase: OverlayEase = [0.32, 0.72, 0, 1];

export const overlayDrawerEnterTransition: OverlayTransition = {
  duration: 0.5,
  ease: overlayEnterEase,
};

/** Centered card width for top/bottom overlays — not full-bleed. */
export const overlayVerticalPanelWidthClass =
  "w-[min(calc(100vw-2rem),26rem)] max-w-full";

/** Shared positioning for floating top/bottom panels. */
export const overlayVerticalPanelClass = [
  overlayVerticalPanelWidthClass,
  "left-1/2 rounded-2xl will-change-transform",
].join(" ");

export const overlayReducedMotionTransition: OverlayTransition = {
  duration: 0.12,
  ease: "linear",
};

export const overlayInstantTransition: OverlayTransition = {
  duration: 0,
};

const OverlayOpenContext = React.createContext<boolean | null>(null);
const OverlayModalContext = React.createContext(true);
const OverlayCenterOffsetContext = React.createContext("0px");
const OverlayPortalContainerContext = React.createContext<{
  container: HTMLElement | null;
  localModal: boolean;
}>({ container: null, localModal: false });

/** Lets preview surfaces choose where portal/fixed overlay layers render. */
export function OverlayPortalScope({
  children,
  className,
  centerOffsetX = "0px",
  localModal = true,
  portal = "scope",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  centerOffsetX?: string;
  localModal?: boolean;
  portal?: "scope" | "document";
}) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const portalContainer = portal === "scope" ? container : null;

  return React.createElement(
    OverlayPortalContainerContext.Provider,
    { value: { container: portalContainer, localModal } },
    React.createElement(
      OverlayCenterOffsetContext.Provider,
      { value: centerOffsetX },
      React.createElement(
        "div",
        {
          ...props,
          ref: setContainer,
          "data-wensity-overlay-scope": "",
          className: cn("relative isolate overflow-hidden", className),
          style: {
            ...style,
            transform: style?.transform
              ? `${style.transform} translateZ(0)`
              : "translateZ(0)",
          },
        },
        children,
      ),
    ),
  );
}

export function useOverlayPortalContainer() {
  return React.useContext(OverlayPortalContainerContext).container;
}

export function useOverlayPortalLocalModal() {
  return React.useContext(OverlayPortalContainerContext).localModal;
}

export function useOverlayCenterOffsetX() {
  return React.useContext(OverlayCenterOffsetContext);
}

export function OverlayOpenProvider({
  open,
  modal = true,
  children,
}: {
  open: boolean;
  modal?: boolean;
  children: React.ReactNode;
}) {
  return React.createElement(
    OverlayOpenContext.Provider,
    { value: open },
    React.createElement(OverlayModalContext.Provider, { value: modal }, children),
  );
}

export function useOverlayOpen() {
  const open = React.useContext(OverlayOpenContext);
  if (open === null) {
    throw new Error(
      "Overlay motion components must be used within Dialog or Sheet.",
    );
  }
  return open;
}

export function useOverlayModal() {
  return React.useContext(OverlayModalContext);
}

export function useControllableOverlayOpen({
  open: openProp,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return { open, setOpen };
}

/** Keeps the portal mounted through exit animations, then fully unmounts. */
export function useOverlayPresence(open: boolean) {
  const [present, setPresent] = React.useState(open);

  React.useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  const onExitComplete = React.useCallback(() => {
    if (!open) setPresent(false);
  }, [open]);

  return { present, onExitComplete };
}

/** Forces entry motion even inside parent AnimatePresence trees with initial={false}. */
export function useOverlayEnterAnimation(open: boolean, present: boolean) {
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    if (!open || !present) {
      setEntered(false);
      return;
    }

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open, present]);

  return open && entered;
}

/** Layout-safe scroll lock while an overlay is open. */
let overlayBodyLockCount = 0;
let overlayTouchLastY: number | undefined;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    Boolean(target.closest("[contenteditable='true']")) ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea"
  );
}

function isKeyboardControlTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      [
        "a[href]",
        "button",
        "input",
        "select",
        "summary",
        "textarea",
        "[aria-haspopup]",
        "[contenteditable='true']",
        "[data-radix-collection-item]",
        "[role='button']",
        "[role='checkbox']",
        "[role='combobox']",
        "[role='gridcell']",
        "[role='link']",
        "[role='menuitem']",
        "[role='menuitemcheckbox']",
        "[role='menuitemradio']",
        "[role='option']",
        "[role='radio']",
        "[role='slider']",
        "[role='spinbutton']",
        "[role='switch']",
        "[role='tab']",
        "[role='treeitem']",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    ),
  );
}

function canElementScroll(element: HTMLElement, deltaY: number) {
  if (Math.abs(deltaY) < 1) return true;

  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const canScrollY =
    (overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay") &&
    element.scrollHeight > element.clientHeight;

  if (!canScrollY) return false;

  const scrollTop = element.scrollTop;
  const maxScrollTop = element.scrollHeight - element.clientHeight;

  if (deltaY < 0) return scrollTop > 0;
  return scrollTop < maxScrollTop - 1;
}

function targetCanScroll(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Node)) return false;

  let element =
    target instanceof HTMLElement ? target : target.parentElement;

  while (element && element !== document.body) {
    if (canElementScroll(element, deltaY)) return true;
    element = element.parentElement;
  }

  return false;
}

function preventBackgroundWheel(event: WheelEvent) {
  if (targetCanScroll(event.target, event.deltaY)) return;
  event.preventDefault();
}

function rememberTouchPosition(event: TouchEvent) {
  overlayTouchLastY = event.touches[0]?.clientY;
}

function preventBackgroundTouch(event: TouchEvent) {
  const currentY = event.touches[0]?.clientY;
  if (currentY === undefined || overlayTouchLastY === undefined) return;

  const deltaY = overlayTouchLastY - currentY;
  overlayTouchLastY = currentY;

  if (targetCanScroll(event.target, deltaY)) return;
  event.preventDefault();
}

function preventBackgroundKeyScroll(event: KeyboardEvent) {
  if (event.defaultPrevented) return;

  const targetIsEditable = isEditableTarget(event.target);
  const targetIsKeyboardControl = isKeyboardControlTarget(event.target);
  if (
    (targetIsEditable || targetIsKeyboardControl) &&
    (event.key === " " ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key.startsWith("Arrow"))
  ) {
    return;
  }

  const viewportDelta = window.innerHeight * 0.85;
  const keyDelta: Record<string, number> = {
    ArrowDown: 40,
    ArrowUp: -40,
    PageDown: viewportDelta,
    PageUp: -viewportDelta,
    End: Number.POSITIVE_INFINITY,
    Home: Number.NEGATIVE_INFINITY,
  };

  if (event.key === " ") {
    if (event.target instanceof HTMLButtonElement) return;
    if (targetCanScroll(event.target, viewportDelta)) return;
    event.preventDefault();
    return;
  }

  const deltaY = keyDelta[event.key];
  if (deltaY === undefined) return;
  if (targetCanScroll(event.target, deltaY)) return;

  event.preventDefault();
}

function installOverlayScrollLock() {
  document.addEventListener("wheel", preventBackgroundWheel, {
    capture: true,
    passive: false,
  });
  document.addEventListener("touchstart", rememberTouchPosition, {
    capture: true,
    passive: true,
  });
  document.addEventListener("touchmove", preventBackgroundTouch, {
    capture: true,
    passive: false,
  });
  document.addEventListener("keydown", preventBackgroundKeyScroll, true);
}

function removeOverlayScrollLock() {
  document.removeEventListener("wheel", preventBackgroundWheel, true);
  document.removeEventListener("touchstart", rememberTouchPosition, true);
  document.removeEventListener("touchmove", preventBackgroundTouch, true);
  document.removeEventListener("keydown", preventBackgroundKeyScroll, true);
  overlayTouchLastY = undefined;
}

export function useOverlayBodyScrollLock(active: boolean) {
  React.useEffect(() => {
    if (!active) return;

    overlayBodyLockCount += 1;
    if (overlayBodyLockCount === 1) installOverlayScrollLock();

    return () => {
      overlayBodyLockCount = Math.max(0, overlayBodyLockCount - 1);

      if (overlayBodyLockCount === 0) removeOverlayScrollLock();
    };
  }, [active]);
}

/** @deprecated Use Framer Motion overlay transitions instead. */
export const overlayBackdropMotionClass =
  "opacity-0 transition-opacity duration-200 ease-out " +
  "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 " +
  "motion-reduce:transition-none";

/** @deprecated Use Framer Motion overlay transitions instead. */
export const overlayDialogMotionClass =
  "opacity-0 transition-opacity duration-200 ease-out " +
  "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 " +
  "motion-reduce:transition-none";

/** @deprecated Use Framer Motion overlay transitions instead. */
export const overlayFullscreenMotionClass =
  "opacity-0 scale-[0.98] transition-[opacity,transform] duration-220 ease-out " +
  "data-[state=open]:opacity-100 data-[state=open]:scale-100 " +
  "data-[state=closed]:opacity-0 data-[state=closed]:scale-[0.98] " +
  "motion-reduce:transition-none motion-reduce:data-[state=closed]:scale-100";

/** @deprecated Use Framer Motion overlay transitions instead. */
export const overlaySheetMotionBySide = {
  left:
    "transition-transform duration-280 ease-[cubic-bezier(0.32,0.72,0,1)] " +
    "translate-x-[-100%] data-[state=open]:translate-x-0 " +
    "data-[state=closed]:translate-x-[-100%] motion-reduce:transition-none",
  right:
    "transition-transform duration-280 ease-[cubic-bezier(0.32,0.72,0,1)] " +
    "translate-x-full data-[state=open]:translate-x-0 " +
    "data-[state=closed]:translate-x-full motion-reduce:transition-none",
  top:
    "transition-transform duration-280 ease-[cubic-bezier(0.32,0.72,0,1)] " +
    "translate-y-[-100%] data-[state=open]:translate-y-0 " +
    "data-[state=closed]:translate-y-[-100%] motion-reduce:transition-none",
  bottom:
    "transition-transform duration-280 ease-[cubic-bezier(0.32,0.72,0,1)] " +
    "translate-y-full data-[state=open]:translate-y-0 " +
    "data-[state=closed]:translate-y-full motion-reduce:transition-none",
} as const;
