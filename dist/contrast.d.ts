/**
 * 色の相対輝度とコントラスト比（WCAG 2.x の式）。DESIGN.md 1.9 の検査に使う。
 * 読めるのは #rgb と #rrggbb だけ（トークンの値をそのまま渡す。var や color-mix は呼ぶ側で除く）
 */
export type Rgb = [number, number, number];
/** #rgb・#rrggbb → [r, g, b]（0〜255）。読めなければ null */
export declare function parseColor(value: string): Rgb | null;
/** 相対輝度（0〜1）。読めない色は例外 */
export declare function luminance(color: string): number;
/** コントラスト比（1〜21）。向きによらない */
export declare function contrast(a: string, b: string): number;
