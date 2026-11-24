import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * 確認のダイアログと、ダイアログの下のボタンの並び（DESIGN.md 2.4）。
 * - 見出しは h2、ボタンの並びは DialogActions: 右寄せの横並びで、キャンセルの側 → 主の操作（右端）
 * - 危ない操作（削除）は主の操作の位置に danger で置き、最初のフォーカスはキャンセルの側に置く
 */
import { useId, useRef, useState } from "preact/hooks";
import { Modal } from "./modal.js";
/** ボタンの並び。キャンセルの側 → その他 → 主の操作（右端。danger なら赤）の順に子を渡す */
export function DialogActions({ children }) {
    return _jsx("div", { class: "ui-dialog-actions", children: children });
}
/** 確認を出して、実行なら true・やめるなら false を返す。node を画面のどこかに置く */
export function useConfirm() {
    const [pending, setPending] = useState(null);
    const current = useRef(null);
    current.current = pending;
    const dialogRef = useRef(null);
    const titleId = useId();
    const messageId = useId();
    const finish = (ok) => {
        const p = current.current;
        if (p === null)
            return;
        current.current = null;
        setPending(null);
        p.resolve(ok);
    };
    const ask = (options) => new Promise((resolve) => setPending({ ...options, resolve }));
    const danger = pending?.danger === true;
    const node = (_jsx(Modal, { open: pending !== null, onClose: () => finish(false), dialogRef: dialogRef, children: pending !== null && (_jsxs("div", { class: "ui-confirm", role: "alertdialog", "aria-labelledby": titleId, "aria-describedby": pending.message !== undefined ? messageId : undefined, children: [_jsx("h2", { id: titleId, children: pending.title }), pending.message !== undefined && (_jsx("p", { id: messageId, class: "ui-confirm-message", children: pending.message })), _jsxs(DialogActions, { children: [_jsx("button", { type: "button", autofocus: danger, onClick: () => dialogRef.current?.close(), children: pending.cancel ?? "やめる" }), _jsx("button", { type: "button", class: danger ? "ui-danger" : "ui-primary", autofocus: !danger, onClick: () => finish(true), children: pending.label })] })] })) }));
    return { ask, node };
}
/** 保存していない入力のあるシートを閉じるとき */
export const DISCARD_CONFIRM = { title: "変更を破棄しますか？", message: "保存していない入力は消えます。", label: "破棄する", cancel: "続ける", danger: true };
/** guard の決まった形: 入力がなければ閉じ、あれば破棄するかを聞く */
export function discardGuard(dirty, ask) {
    return !dirty || ask(DISCARD_CONFIRM);
}
