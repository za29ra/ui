/**
 * 端末に覚える値（localStorage）。キーは `<アプリ名>.<キー>`（DESIGN.md 3.8）。
 * アプリ名は英小文字・数字・`-` だけ（ほかのアプリのキーと混ざらず、`themeBootScript` がインラインのスクリプトに埋めても `</script>` で抜けられないように）。
 * storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため）
 */
export function appKey(app, key) {
    if (!/^[a-z0-9-]+$/.test(app))
        throw new Error(`アプリ名が不正です: ${app}`);
    return `${app}.${key}`;
}
