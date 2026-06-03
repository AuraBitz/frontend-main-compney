import { themeQuartz } from "ag-grid-community";
import type { ThemeMode } from "@/lib/theme";

function readCssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** AG Grid theme synced with global CSS variables (--grid-*). */
export function createAdminGridTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  return themeQuartz.withParams({
    accentColor: readCssVar("--grid-accent", isDark ? "#818cf8" : "#4f46e5"),
    backgroundColor: readCssVar("--grid-background", isDark ? "#1e293b" : "#ffffff"),
    borderColor: readCssVar("--grid-border", isDark ? "#334155" : "#e2e8f0"),
    borderRadius: 10,
    browserColorScheme: mode,
    cellHorizontalPadding: 18,
    cellTextColor: readCssVar("--grid-cell-text", isDark ? "#e2e8f0" : "#1e293b"),
    chromeBackgroundColor: readCssVar(
      "--grid-chrome-bg",
      isDark ? "#0f172a" : "#f8fafc"
    ),
    fontFamily: "inherit",
    fontSize: 13.5,
    foregroundColor: readCssVar("--grid-cell-text", isDark ? "#e2e8f0" : "#1e293b"),
    headerBackgroundColor: readCssVar(
      "--grid-header-bg",
      isDark ? "#1e293b" : "#f1f5f9"
    ),
    headerFontSize: 12,
    headerFontWeight: 600,
    headerTextColor: readCssVar(
      "--grid-header-text",
      isDark ? "#94a3b8" : "#64748b"
    ),
    oddRowBackgroundColor: readCssVar(
      "--grid-row-odd",
      isDark ? "#172033" : "#fafbfc"
    ),
    rowHoverColor: readCssVar(
      "--grid-row-hover",
      isDark ? "#1e3a5f" : "#eef2ff"
    ),
    rowVerticalPaddingScale: 1.35,
    spacing: 10,
    wrapperBorder: true,
    wrapperBorderRadius: 12,
  });
}

/** @deprecated Use createAdminGridTheme via useTheme in DynamicTable */
export const adminGridTheme = createAdminGridTheme("light");
