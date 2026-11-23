/**
 * 色の相対輝度とコントラスト比（WCAG 2.x の式）。DESIGN.md 1.9 の検査に使う。
 * 読めるのは #rgb と #rrggbb だけ（トークンの値をそのまま渡す。var や color-mix は呼ぶ側で除く）
 */
/** #rgb・#rrggbb → [r, g, b]（0〜255）。読めなければ null */
export function parseColor(value) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
    if (m === null)
        return null;
    const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function channel(v) {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
/** 相対輝度（0〜1）。読めない色は例外 */
export function luminance(color) {
    const rgb = parseColor(color);
    if (rgb === null)
        throw new Error(`色を読めません: ${color}`);
    const [r, g, b] = rgb.map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** コントラスト比（1〜21）。向きによらない */
export function contrast(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
