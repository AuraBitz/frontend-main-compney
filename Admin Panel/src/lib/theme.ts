export const THEME_STORAGE_KEY = "admin-theme";

export type ThemeMode = "light" | "dark";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveInitialTheme(): ThemeMode {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}
