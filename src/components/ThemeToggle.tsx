import { useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button, type ButtonVariant } from "@/components/wensity/button";
import { getActiveTheme, setTheme, type Theme } from "@/lib/theme";

/** Sun/moon button that flips between light and dark and remembers the choice.
 *  Pass `withLabel` to show a "Light"/"Dark" text label (more discoverable when
 *  the button stands alone, e.g. on the login screen). */
export function ThemeToggle({
  className,
  variant = "ghost",
  withLabel = false,
}: {
  className?: string;
  variant?: ButtonVariant;
  withLabel?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>(() => getActiveTheme());

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  const icon = theme === "dark" ? <IconSun className="size-5" /> : <IconMoon className="size-5" />;

  if (withLabel) {
    return (
      <Button
        type="button"
        variant={variant}
        size="sm"
        aria-label={label}
        title={label}
        onClick={toggle}
        leftIcon={icon}
        className={className}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggle}
      className={className}
    >
      {icon}
    </Button>
  );
}
