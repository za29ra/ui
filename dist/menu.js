import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { afterRelease, createOpenCount, moveInMenu, opensOnRelease } from "./menu-rules.js";
/** Menu に渡す handle を作る */
export function useMenu() {
    const id = `ui-menu-${useId()}`;
    const menuRef = useRef(null);
    const anchorRef = useRef(null);
    const [request, setRequest] = useState(null);
    const [opens] = useState(createOpenCount);
    const openAt = (e) => {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        // 待つかどうかを決める前に数える（離すのを待つ間に、前のメニューの閉じた知らせが来る）
        const seq = opens.request();
        const go = () => setRequest({ x, y, seq });
        // buttons の無い作り物のイベント（見本など）は、押していないものとして扱う
        if (opensOnRelease(e.buttons ?? 0))
            afterRelease(window, go, undefined, () => opens.settle(seq));
        else
            go();
    };
    return { id, menuRef, anchorRef, openAt, request, opens };
}
/** 開くボタンに広げる props */
export function menuTrigger(handle) {
    return { commandfor: handle.id, command: "toggle-popover", "aria-haspopup": "menu" };
}
export function Menu({ menu, label, items, class: cls = "", onClose }) {
    const { menuRef, anchorRef, request, opens } = menu;
    // 描く前に来た要求（あとから Menu を出したとき）では開かない。開いた要求の番号を覚え、それより新しいときだけ開く
    const handled = useRef(request?.seq ?? 0);
    // 右クリック: 押した位置にアンカーを置いて開く。項目は描いたあとなので、先頭の項目にフォーカスが入る
    useEffect(() => {
        const el = menuRef.current;
        const anchor = anchorRef.current;
        if (request === null)
            return;
        if (request.seq <= handled.current || el === null || anchor === null) {
            opens.settle(request.seq);
            return;
        }
        handled.current = request.seq;
        anchor.style.left = `${request.x}px`;
        anchor.style.top = `${request.y}px`;
        if (el.matches(":popover-open"))
            el.hidePopover();
        // 閉じると beforetoggle で外す。前のメニューを閉じたあとに付ける
        el.dataset.at = "";
        el.showPopover({ source: anchor });
        opens.settle(request.seq);
    }, [request?.seq]);
    const hide = () => menuRef.current?.hidePopover();
    return (_jsxs(_Fragment, { children: [_jsx("span", { ref: anchorRef, class: "ui-menu-anchor" }), _jsx("dialog", { id: menu.id, ref: menuRef, class: `ui-menu ${cls}`.trim(), popover: "auto", "aria-label": label, onKeyDown: moveInMenu, onBeforeToggle: (e) => {
                    // toggle と違い、閉じるその時に来る（あとから来て、次に右クリックで開いたメニューの data-at を消さない）
                    if (e.newState === "closed")
                        delete e.currentTarget.dataset.at;
                }, onToggle: (e) => {
                    // 次の右クリックを待っている間に来た、前のメニューの閉じた知らせでは呼ばない（menu-rules の createOpenCount）
                    if (e.newState === "closed" && opens.settled())
                        onClose?.();
                }, children: _jsx("div", { class: "ui-menu-list", children: items.map((item, i) => {
                        const key = item.key ?? i;
                        if (item.kind === "separator")
                            return _jsx("hr", { class: "ui-menu-sep" }, key);
                        const icon = item.icon !== undefined && _jsx("span", { class: `ui-ico ${item.icon}`, "aria-hidden": "true" });
                        if (item.kind === "link") {
                            return (_jsxs("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", onClick: hide, children: [icon, item.label] }, key));
                        }
                        const classes = [item.danger ? "ui-danger" : "", item.checked !== undefined ? "ui-menu-check" : ""].filter(Boolean).join(" ");
                        return (_jsxs("button", { type: "button", class: classes || undefined, "aria-pressed": item.checked, onClick: () => {
                                hide();
                                item.onSelect();
                            }, children: [icon, item.label] }, key));
                    }) }) })] }));
}
