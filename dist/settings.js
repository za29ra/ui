import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * 設定の部品（DESIGN.md 2.1・4 章）。
 * - SettingsLayout: 上のタブと本文の枠だけ。開いている項目と URL の結び付け（/settings/<項目>）はアプリが持つ
 * - ThemeSettings: 表示（自動 | ライト | ダーク）と、ライト・ダークのテーマのカード。カードの見本の中身はアプリが preview(id) で渡す
 * - NotifySettings: この端末の通知の状態と、受け取る・やめるのスイッチ。文言は settings-text.ts（アプリ別の部分は props）
 * アイコン（カードのチェック・通知の状態）は ui-ico-*（DESIGN.md 2.5）
 */
import { useId } from "preact/hooks";
import { DARK_THEMES, LIGHT_THEMES, MODES } from "./theme.js";
import { pushStateText } from "./settings-text.js";
export * from "./settings-text.js";
export function SettingsLayout({ tabs, current, onTab, label = "設定の項目", class: cls = "", children }) {
    return (_jsxs("div", { class: `ui-settings ${cls}`.trim(), children: [_jsx("div", { class: "ui-tabs", role: "group", "aria-label": label, children: tabs.map((t) => (_jsx("button", { type: "button", "aria-pressed": current === t.id, onClick: () => onTab(t.id), children: t.name }, t.id))) }), _jsx("div", { class: "ui-settings-body", children: children })] }));
}
function ThemeChoices(p) {
    return (_jsxs("fieldset", { class: "ui-settings-group", children: [_jsx("legend", { children: p.legend }), _jsx("div", { class: "ui-theme-grid", children: p.themes.map((t) => (_jsxs("label", { class: "ui-theme-card", children: [_jsx("input", { type: "radio", name: p.name, value: t.id, checked: p.value === t.id, onChange: () => p.onChange(t.id) }), _jsx("span", { class: "ui-theme-preview", "data-theme": t.id, "aria-hidden": "true", children: p.preview(t.id) }), _jsxs("span", { class: "ui-theme-card-name", children: [t.name, _jsx("span", { class: "ui-theme-card-check", "aria-hidden": "true", children: _jsx("span", { class: "ui-ico ui-ico-check" }) })] })] }, t.id))) })] }));
}
export function ThemeSettings({ theme, onTheme, preview }) {
    const id = useId();
    return (_jsxs(_Fragment, { children: [_jsxs("div", { class: "ui-settings-group", children: [_jsx("span", { id: `${id}-mode`, children: "\u8868\u793A" }), _jsx("div", { class: "ui-segmented", role: "group", "aria-labelledby": `${id}-mode`, children: MODES.map((m) => (_jsx("button", { type: "button", "aria-pressed": theme.mode === m.id, onClick: () => onTheme({ ...theme, mode: m.id }), children: m.name }, m.id))) }), _jsx("p", { class: "ui-settings-note", children: "\u300C\u81EA\u52D5\u300D\u306F\u7AEF\u672B\u306E\u5916\u89B3\u306B\u5408\u308F\u305B\u307E\u3059\u3002\u8D77\u52D5\u4E2D\u306E\u753B\u9762\u3060\u3051\u306F\u3001\u3053\u306E\u8A2D\u5B9A\u306B\u3088\u3089\u305A\u7AEF\u672B\u306E\u5916\u89B3\u3067\u6C7A\u307E\u308A\u307E\u3059\u3002" })] }), _jsx(ThemeChoices, { legend: "\u30E9\u30A4\u30C8\u306E\u30C6\u30FC\u30DE", name: `${id}-light`, themes: LIGHT_THEMES, value: theme.light, onChange: (light) => onTheme({ ...theme, light }), preview: preview }), _jsx(ThemeChoices, { legend: "\u30C0\u30FC\u30AF\u306E\u30C6\u30FC\u30DE", name: `${id}-dark`, themes: DARK_THEMES, value: theme.dark, onChange: (dark) => onTheme({ ...theme, dark }), preview: preview })] }));
}
export function NotifySettings({ push, appName, onDetail }) {
    const text = push.status === null ? null : pushStateText(push.status, { appName, onDetail });
    return (_jsxs("div", { class: "ui-settings-group", children: [_jsx("span", { children: "\u3053\u306E\u7AEF\u672B\u306E\u901A\u77E5" }), _jsx("div", { class: "ui-push-status", role: "status", "data-state": push.status ?? "checking", children: text === null ? (_jsx("p", { class: "ui-settings-note", children: "\u78BA\u8A8D\u4E2D\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("span", { class: "ui-push-status-icon", "aria-hidden": "true", children: _jsx("span", { class: `ui-ico ui-ico-${text.icon}` }) }), _jsxs("div", { children: [_jsx("p", { class: "ui-push-status-title", children: text.title }), _jsx("p", { class: "ui-push-status-detail", children: text.detail })] })] })) }), (push.status === "on" || push.status === "off") && (_jsxs("label", { class: "ui-switch-row", children: [_jsx("span", { children: "\u3053\u306E\u7AEF\u672B\u3067\u901A\u77E5\u3092\u53D7\u3051\u53D6\u308B" }), _jsx("input", { type: "checkbox", role: "switch", class: "ui-switch", checked: push.status === "on", disabled: push.busy, onChange: (e) => (e.currentTarget.checked ? push.enable() : push.disable()) })] }))] }));
}
