/**
 * テーマの設定（表示モードと、ライト・ダークそれぞれで使うテーマ）と、今使うテーマの決め方。
 * 設定は端末ごとに localStorage に覚える。アプリの index.html（`themeBootScript` を差し込む）も同じ規則で決める（テストで確かめる）
 */
import type { StorageLike } from "./storage.ts";
import { appKey } from "./storage.ts";

export type Mode = "auto" | "light" | "dark";
export type LightTheme = "default-light" | "latte";
export type DarkTheme = "default-dark" | "frappe" | "macchiato" | "mocha";
export type ThemeId = LightTheme | DarkTheme;

export interface ThemePrefs {
  mode: Mode;
  light: LightTheme;
  dark: DarkTheme;
}

export interface ResolvedTheme {
  id: ThemeId;
  scheme: "light" | "dark";
}

export const MODES: Array<{ id: Mode; name: string }> = [
  { id: "auto", name: "自動" },
  { id: "light", name: "ライト" },
  { id: "dark", name: "ダーク" },
];

/** 先頭が既定（現行のテーマ） */
export const LIGHT_THEMES: Array<{ id: LightTheme; name: string }> = [
  { id: "default-light", name: "標準" },
  { id: "latte", name: "Catppuccin Latte" },
];

export const DARK_THEMES: Array<{ id: DarkTheme; name: string }> = [
  { id: "default-dark", name: "標準" },
  { id: "frappe", name: "Catppuccin Frappé" },
  { id: "macchiato", name: "Catppuccin Macchiato" },
  { id: "mocha", name: "Catppuccin Mocha" },
];

export const DEFAULT_THEME_PREFS: ThemePrefs = { mode: "auto", light: "default-light", dark: "default-dark" };

/** 設定を覚えるキー（`<アプリ名>.theme`） */
export function themeKey(app: string): string {
  return appKey(app, "theme");
}

export const DARK_QUERY = "(prefers-color-scheme: dark)";

export function resolveTheme(prefs: ThemePrefs, systemDark: boolean): ResolvedTheme {
  const dark = prefs.mode === "dark" || (prefs.mode === "auto" && systemDark);
  return dark ? { id: prefs.dark, scheme: "dark" } : { id: prefs.light, scheme: "light" };
}

/** 一覧にある id ならそれ、なければ既定 */
function pick<T extends string>(list: Array<{ id: T }>, value: unknown, fallback: T): T {
  return list.find((t) => t.id === value)?.id ?? fallback;
}

/** storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため） */
export function loadThemePrefs(app: string, storage: () => StorageLike): ThemePrefs {
  try {
    const raw: unknown = JSON.parse(storage().getItem(themeKey(app)) ?? "{}");
    const v = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    return {
      mode: pick(MODES, v.mode, DEFAULT_THEME_PREFS.mode),
      light: pick(LIGHT_THEMES, v.light, DEFAULT_THEME_PREFS.light),
      dark: pick(DARK_THEMES, v.dark, DEFAULT_THEME_PREFS.dark),
    };
  } catch {
    return DEFAULT_THEME_PREFS;
  }
}

export function saveThemePrefs(app: string, storage: () => StorageLike, prefs: ThemePrefs): void {
  try {
    storage().setItem(themeKey(app), JSON.stringify({ mode: prefs.mode, light: prefs.light, dark: prefs.dark }));
  } catch {
    // 覚えられなくても動く
  }
}

/**
 * 描画の前に <html data-theme> を付ける、index.html の <head> に差し込む小さなスクリプト（読み込み直後に色がちらつかないように）。
 * 決め方は resolveTheme・loadThemePrefs と同じ（テストで全部の組を確かめる）。古いブラウザでも動くよう ES5 で書く
 */
export function themeBootScript(app: string): string {
  const light = JSON.stringify(LIGHT_THEMES.map((t) => t.id));
  const dark = JSON.stringify(DARK_THEMES.map((t) => t.id));
  const key = JSON.stringify(themeKey(app));
  return `(function () {
  var light = ${light};
  var dark = ${dark};
  var t = {};
  try {
    var v = JSON.parse(localStorage.getItem(${key}) || "{}");
    if (v && typeof v === "object") t = v;
  } catch (e) {}
  var useDark = t.mode === "dark" || (t.mode !== "light" && matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
  document.documentElement.dataset.theme = useDark
    ? (dark.indexOf(t.dark) >= 0 ? t.dark : dark[0])
    : (light.indexOf(t.light) >= 0 ? t.light : light[0]);
})();`;
}
