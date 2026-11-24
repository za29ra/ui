/**
 * テーマの設定の状態。描画のたびに <html data-theme> を付け直し、OS の外観の変化に追従する。
 * 属性は描画の中で付ける（effect だと子の描画より後になり、前のテーマの色を一度読んでしまう）。
 * theme-color（Safari の上下の帯の色）は、そのテーマの --bg を読んで合わせる
 */
import { useEffect, useState } from "preact/hooks";
import { DARK_QUERY, loadThemePrefs, resolveTheme, saveThemePrefs } from "./theme.js";
export function useTheme(app, storage) {
    const [prefs, setPrefs] = useState(() => loadThemePrefs(app, storage));
    const [systemDark, setSystemDark] = useState(() => matchMedia(DARK_QUERY).matches);
    useEffect(() => {
        const mq = matchMedia(DARK_QUERY);
        const on = () => setSystemDark(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);
    const resolved = resolveTheme(prefs, systemDark);
    document.documentElement.dataset.theme = resolved.id;
    useEffect(() => {
        const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
        if (bg !== "")
            document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
    }, [resolved.id]);
    function change(next) {
        setPrefs(next);
        saveThemePrefs(app, storage, next);
    }
    return { prefs, resolved, change };
}
