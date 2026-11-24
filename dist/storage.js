/**
 * 端末に覚える値（localStorage）。キーは `<アプリ名>.<キー>`（DESIGN.md 3.8）。
 * storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため）
 */
export function appKey(app, key) {
    if (app === "" || app.includes("."))
        throw new Error(`アプリ名が不正です: ${app}`);
    return `${app}.${key}`;
}
