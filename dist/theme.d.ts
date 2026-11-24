/**
 * テーマの設定（表示モードと、ライト・ダークそれぞれで使うテーマ）と、今使うテーマの決め方。
 * 設定は端末ごとに localStorage に覚える。アプリの index.html（`themeBootScript` を差し込む）も同じ規則で決める（テストで確かめる）
 */
import type { StorageLike } from "./storage.ts";
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
export declare const MODES: Array<{
    id: Mode;
    name: string;
}>;
/** 先頭が既定（現行のテーマ） */
export declare const LIGHT_THEMES: Array<{
    id: LightTheme;
    name: string;
}>;
export declare const DARK_THEMES: Array<{
    id: DarkTheme;
    name: string;
}>;
export declare const DEFAULT_THEME_PREFS: ThemePrefs;
/** 設定を覚えるキー（`<アプリ名>.theme`） */
export declare function themeKey(app: string): string;
export declare const DARK_QUERY = "(prefers-color-scheme: dark)";
export declare function resolveTheme(prefs: ThemePrefs, systemDark: boolean): ResolvedTheme;
/**
 * storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため）。
 * アプリ名が不正なら投げる（storage の例外と違い、黙って既定にしない）
 */
export declare function loadThemePrefs(app: string, storage: () => StorageLike): ThemePrefs;
export declare function saveThemePrefs(app: string, storage: () => StorageLike, prefs: ThemePrefs): void;
/**
 * 描画の前に <html data-theme> を付ける、index.html の <head> に差し込む小さなスクリプト（読み込み直後に色がちらつかないように）。
 * 決め方は resolveTheme・loadThemePrefs と同じ（テストで全部の組を確かめる）。古いブラウザでも動くよう ES5 で書く
 */
export declare function themeBootScript(app: string): string;
