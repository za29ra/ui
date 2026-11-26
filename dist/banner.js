import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
export function Banner({ message, actions, kind, class: cls = "" }) {
    return (_jsxs("div", { class: `ui-banner ${cls}`.trim(), "data-kind": kind, role: "alert", children: [_jsx("p", { class: "ui-banner-text", children: message }), _jsx("div", { class: "ui-banner-actions", children: actions.map((a, i) => (_jsx("button", { type: "button", onClick: () => a.onClick(), children: a.label }, a.key ?? i))) })] }));
}
