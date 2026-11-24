import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * 入力シートの骨格。Modal の中で使う。
 * - ヘッダー: 左に ✕、h2（何のシートか）と副題（空き・パンくずなど）、右に任意の 1 つ。流れずに上に残る（上部のスワイプで閉じる帯と同じ所）
 * - 本文: ここだけスクロール。削除などの操作は本文の末尾に置く
 * - フッター: 主ボタンを本文の上に浮かせる（線で区切らない）。文言は「予定を追加」「設定を更新」のように何をするかを書く。
 *   iPhone のキーボードが出たら、シートは下端に付けたまま、ボタンをその分だけ上げる（ダイアログの形では上げず、ダイアログの高さをキーボードの上に収める）
 * footer に null を渡すと、ボタンは出さずに場所だけ取っておく（押せるときだけ出すボタンで、出たときに本文の余白が変わってシートの高さが跳ねないように）
 * onSubmit を渡すと全体を <form> にする（フッターの submit で確定）。本文に別の form があるときは渡さず、ボタンの form 属性で結ぶ
 */
import { useEffect } from "preact/hooks";
import { keyboardInset, revealDelta } from "./modal-rules.js";
import { SheetClose } from "./modal.js";
export function SheetFrame({ dialogRef, title, subtitle, right, footer, onSubmit, label, closeIcon, children }) {
    useKeyboardInset(dialogRef);
    const inner = (_jsxs(_Fragment, { children: [_jsxs("header", { class: "ui-sheet-head", onMouseDown: (e) => e.preventDefault(), children: [_jsx(SheetClose, { dialogRef: dialogRef, icon: closeIcon }), _jsxs("div", { class: "ui-sheet-title", children: [title !== undefined && _jsx("h2", { children: title }), subtitle !== undefined && _jsx("div", { class: "ui-sheet-sub", children: subtitle })] }), right] }), _jsx("div", { class: "ui-sheet-main", children: children }), footer !== undefined && _jsx("footer", { class: "ui-sheet-foot", children: footer })] }));
    if (onSubmit === undefined) {
        return (_jsx("div", { class: "ui-sheet-frame", "aria-label": label, children: inner }));
    }
    return (_jsx("form", { class: "ui-sheet-frame", "aria-label": label, onSubmit: (e) => {
            e.preventDefault();
            onSubmit();
        }, children: inner }));
}
/**
 * キーボードが隠している高さを dialog の --keyboard-inset に、見えている範囲が下へずれた分を --keyboard-top に入れる
 * （CSS がフッターの下にその分を空け、シートの高さを見えている範囲に収める）
 */
function useKeyboardInset(dialogRef) {
    useEffect(() => {
        const vv = window.visualViewport;
        const d = dialogRef.current;
        if (vv == null || d === null)
            return;
        /** 入力中の欄を本文の見えている範囲に出す（iOS は見えている範囲をずらすだけで、本文のスクロールは動かさない） */
        const reveal = () => {
            const el = document.activeElement;
            const main = el instanceof HTMLElement ? el.closest(".ui-sheet-main") : null;
            // popup は自分で画面に収まる。中の欄を見せようと本文を動かすと、起点ごと流れる
            if (main === null || !d.contains(main) || el.closest("[data-popup]") !== null)
                return;
            // scrollIntoView は画面全体までずらすことがあるので、本文の scrollTop だけを動かす。
            // 下は、本文の下端・キーボードの上端（見えている範囲の下端）・浮かせた主ボタンの上端のうち一番上
            requestAnimationFrame(() => {
                const m = main.getBoundingClientRect();
                const r = el.getBoundingClientRect();
                const button = d.querySelector(".ui-sheet-foot > *");
                const bottom = Math.min(m.bottom, vv.offsetTop + vv.height, button?.getBoundingClientRect().top ?? Infinity) - 12;
                main.scrollTop += revealDelta(r.top, r.bottom, m.top + 8, bottom);
            });
        };
        let last = -1;
        const update = () => {
            const inset = keyboardInset(window.innerHeight, vv.height, vv.offsetTop, vv.scale);
            d.style.setProperty("--keyboard-inset", `${inset}px`);
            d.style.setProperty("--keyboard-top", `${inset > 0 ? Math.round(vv.offsetTop) : 0}px`);
            d.classList.toggle("ui-keyboard", inset > 0);
            // フッターが上がって本文が狭くなったら、欄がフッターやキーボードの裏に隠れないよう出し直す
            if (inset !== last && inset > 0)
                reveal();
            last = inset;
        };
        update();
        vv.addEventListener("resize", update);
        vv.addEventListener("scroll", update);
        d.addEventListener("focusin", reveal);
        return () => {
            vv.removeEventListener("resize", update);
            vv.removeEventListener("scroll", update);
            d.removeEventListener("focusin", reveal);
            d.style.removeProperty("--keyboard-inset");
            d.style.removeProperty("--keyboard-top");
            d.classList.remove("ui-keyboard");
        };
    }, []);
}
