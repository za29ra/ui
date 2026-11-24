import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * トースト（DESIGN.md 3.4）。
 * - 一度に 1 つ。新しいものが古いものに替わる
 * - 消えるまでの時間は CSS のアニメーション（ui-toast-out）が数える: 5 秒（--toast-duration）、操作があれば 10 秒（--toast-duration-action）
 * - マウスを載せている間とフォーカスのある間は止まる
 * - sticky のトーストは時間で消えない（操作のボタンを押すか、別のトーストに替わるまで残る）
 * - 操作のないトーストには ✕（閉じる）を置く
 * 見た目は popover="manual" で top layer に出す（シートの背景の下に隠れない）。
 * 読み上げは popover の外に常に置く role="status" に同じ文言を入れる（閉じている popover は display: none で、読み上げの対象にならないため）
 */
import { useId, useLayoutEffect, useRef, useState } from "preact/hooks";
import { CloseIcon } from "./close-icon.js";
import { dismissToast, toastKind } from "./toast-state.js";
export * from "./toast-state.js";
export function useToastState() {
    const [toast, setToast] = useState(null);
    const seq = useRef(0);
    const notify = (text, action, sticky) => setToast({ id: ++seq.current, text, action, sticky });
    const dismiss = (id) => setToast((t) => dismissToast(t, id));
    return { toast, notify, dismiss };
}
/** popover を閉じる。開いていないときと、popover に対応していないときは何もしない */
function hide(el) {
    try {
        if (el?.matches(":popover-open"))
            el.hidePopover();
    }
    catch {
        // popover に対応していない
    }
}
export function Toast({ toast, onClose }) {
    const ref = useRef(null);
    const id = useId();
    // 出している popover のトーストの id（閉じたとき、これを消す）
    const shown = useRef(null);
    // id で見る（同じ文言が続いても出し直す）。出し直すと top layer の一番上に来るので、あとから開いたシートより前に出る
    useLayoutEffect(() => {
        const el = ref.current;
        if (el === null)
            return;
        hide(el);
        shown.current = toast?.id ?? null;
        try {
            if (toast !== null)
                el.showPopover();
        }
        catch {
            // popover に対応していなければ、固定の位置に出す（閉じるのはボタンか次のトースト）
        }
    }, [toast?.id ?? null]);
    // commandfor・command に対応していないブラウザのために、押したときにも閉じる（対応していれば、もう閉じている）
    const close = () => {
        const el = ref.current;
        hide(el);
        // popover に対応していないときは toggle が来ないので、ここで消す
        if (el !== null && typeof el.hidePopover !== "function" && shown.current !== null)
            onClose(shown.current);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { class: "ui-visually-hidden", role: "status", children: toast?.text }), _jsx("div", { ref: ref, id: id, class: "ui-toast-region", popover: "manual", onToggle: (e) => {
                    if (e.newState === "closed" && shown.current !== null)
                        onClose(shown.current);
                }, children: toast !== null && (_jsxs("div", { class: "ui-toast", "data-kind": toastKind(toast), onAnimationEnd: (e) => {
                        if (e.animationName === "ui-toast-out")
                            close();
                    }, children: [_jsx("span", { children: toast.text }), toast.action !== undefined ? (_jsx("button", { type: "button", class: "ui-text", commandfor: id, command: "hide-popover", onClick: () => {
                                toast.action.run();
                                close();
                            }, children: toast.action.label })) : (_jsx("button", { type: "button", class: "ui-icon ui-toast-close", commandfor: id, command: "hide-popover", "aria-label": "\u9589\u3058\u308B", onClick: close, children: _jsx(CloseIcon, {}) }))] }, toast.id)) })] }));
}
