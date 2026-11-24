import { appKey } from "./storage.js";
export const MODES = [
    { id: "auto", name: "自動" },
    { id: "light", name: "ライト" },
    { id: "dark", name: "ダーク" },
];
/** 先頭が既定（現行のテーマ） */
export const LIGHT_THEMES = [
    { id: "default-light", name: "標準" },
    { id: "latte", name: "Catppuccin Latte" },
];
export const DARK_THEMES = [
    { id: "default-dark", name: "標準" },
    { id: "frappe", name: "Catppuccin Frappé" },
    { id: "macchiato", name: "Catppuccin Macchiato" },
    { id: "mocha", name: "Catppuccin Mocha" },
];
export const DEFAULT_THEME_PREFS = { mode: "auto", light: "default-light", dark: "default-dark" };
/** 設定を覚えるキー（`<アプリ名>.theme`） */
export function themeKey(app) {
    return appKey(app, "theme");
}
export const DARK_QUERY = "(prefers-color-scheme: dark)";
export function resolveTheme(prefs, systemDark) {
    const dark = prefs.mode === "dark" || (prefs.mode === "auto" && systemDark);
    return dark ? { id: prefs.dark, scheme: "dark" } : { id: prefs.light, scheme: "light" };
}
/** 一覧にある id ならそれ、なければ既定 */
function pick(list, value, fallback) {
    return list.find((t) => t.id === value)?.id ?? fallback;
}
/**
 * storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため）。
 * アプリ名が不正なら投げる（storage の例外と違い、黙って既定にしない）
 */
export function loadThemePrefs(app, storage) {
    const key = themeKey(app);
    try {
        const raw = JSON.parse(storage().getItem(key) ?? "{}");
        const v = typeof raw === "object" && raw !== null ? raw : {};
        return {
            mode: pick(MODES, v.mode, DEFAULT_THEME_PREFS.mode),
            light: pick(LIGHT_THEMES, v.light, DEFAULT_THEME_PREFS.light),
            dark: pick(DARK_THEMES, v.dark, DEFAULT_THEME_PREFS.dark),
        };
    }
    catch {
        return DEFAULT_THEME_PREFS;
    }
}
export function saveThemePrefs(app, storage, prefs) {
    const key = themeKey(app);
    try {
        storage().setItem(key, JSON.stringify({ mode: prefs.mode, light: prefs.light, dark: prefs.dark }));
    }
    catch {
        // 覚えられなくても動く
    }
}
/**
 * 描画の前に <html data-theme> を付ける、index.html の <head> に差し込む小さなスクリプト（読み込み直後に色がちらつかないように）。
 * 決め方は resolveTheme・loadThemePrefs と同じ（テストで全部の組を確かめる）。古いブラウザでも動くよう ES5 で書く
 */
export function themeBootScript(app) {
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
