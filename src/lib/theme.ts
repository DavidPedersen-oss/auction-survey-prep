// Light/dark theme control. Wensity themes are driven by a `.dark` class on
// <html>; we default to the OS preference but let an explicit choice win and
// persist it in localStorage.

export type Theme = "light" | "dark";

const STORAGE_KEY = "asp-theme";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The user's explicit choice, or null if they've never picked one. */
export function storedTheme(): Theme | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function systemTheme(): Theme {
  return media().matches ? "dark" : "light";
}

/** The theme currently in effect: the explicit choice, else the OS preference. */
export function getActiveTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  // keep the mobile browser chrome (address bar) in sync with the theme
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0b" : "#fafafa");
}

/** Persist an explicit choice and apply it immediately. */
export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

/** Run once at startup: apply the active theme and keep following the OS
 *  preference until the user makes an explicit choice. */
export function initTheme(): void {
  applyTheme(getActiveTheme());
  media().addEventListener("change", () => {
    if (!storedTheme()) applyTheme(systemTheme());
  });
}
