import { jsx as _jsx } from "preact/jsx-runtime";
import { useLayoutEffect, useRef } from "preact/hooks";
import { TAP_SLOP } from "./modal-rules.js";
import { placePopup, popupMaxHeight, pressKind, visibleView } from "./popup-rules.js";
/** popup を開く欄に付ける（押すと、開いている popup から切り替わる） */
export const POPUP_TRIGGER = { "data-popup-trigger": "" };
let current = null;
/** within の中に popup が開いているか */
export function hasPopup(within) {
    return current !== null && within.contains(current.el);
}
/** within の中の popup を閉じる。閉じたら true（Modal の cancel は、それで終える） */
export function closePopup(within) {
    if (current === null || !within.contains(current.el))
        return false;
    current.close();
    return true;
}
export function Popup({ anchor, onClose, label, class: cls, beside = false, children }) {
    const ref = useRef(null);
    const latest = useRef({ anchor, onClose });
    latest.current = { anchor, onClose };
    const place = () => {
        const el = ref.current;
        if (el === null)
            return;
        const a = latest.current.anchor();
        if (a == null || !a.isConnected)
            return latest.current.onClose();
        const vv = window.visualViewport;
        const seen = { left: vv?.offsetLeft ?? 0, top: vv?.offsetTop ?? 0, width: vv?.width ?? innerWidth, height: vv?.height ?? innerHeight };
        const css = getComputedStyle(el);
        const safe = (side) => parseFloat(css.getPropertyValue(`--safe-${side}`)) || 0;
        const view = visibleView(seen, innerHeight, { top: safe("top"), bottom: safe("bottom") });
        const edges = a.getBoundingClientRect();
        el.style.setProperty("--popup-max", `${popupMaxHeight(edges, view, beside)}px`);
        const at = placePopup(edges, { width: el.offsetWidth, height: el.offsetHeight }, view);
        el.style.left = `${at.left}px`;
        el.style.top = `${at.top}px`;
    };
    useLayoutEffect(() => {
        const el = ref.current;
        const self = { el, close: () => latest.current.onClose() };
        if (current !== null)
            current.close();
        current = self;
        try {
            el.showPopover();
        }
        catch {
            // popover に対応していなければ、そのまま固定の位置に出る
        }
        const anchorHas = (target) => target instanceof Node && latest.current.anchor()?.contains(target) === true;
        const popupHas = (target) => target instanceof Node && el.contains(target);
        /** 押し始めが外側か。touch の押し始めの位置は、タップかスクロールかを分けるのに使う */
        let outside = false;
        let from = { x: 0, y: 0 };
        /** 最後の操作が Tab か。Safari はボタンを押すとフォーカスが dialog に移るので、focusin だけでは外に出たと決めない */
        let tabbed = false;
        const stop = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const dismiss = () => {
            const a = latest.current.anchor();
            // 文字の欄が起点なら、入力も終える（mousedown を止めたのでフォーカスが残っている）
            if (a instanceof HTMLInputElement && a === document.activeElement)
                a.blur();
            self.close();
        };
        const onPointerDown = (e) => {
            tabbed = false;
            from = { x: e.clientX, y: e.clientY };
            const inTrigger = e.target instanceof Element && e.target.closest("[data-popup-trigger]") !== null;
            outside = pressKind({ inPopup: popupHas(e.target), inAnchor: anchorHas(e.target), inTrigger }) === "outside";
        };
        const onMouseDown = (e) => {
            if (outside)
                stop(e);
        };
        const onTouchEnd = (e) => {
            if (!outside)
                return;
            e.stopPropagation();
            const t = e.changedTouches[0];
            // 動かしたならスクロール（popup は付いていく）。止められないときは click で閉じる
            if (!e.cancelable || Math.abs(t.clientX - from.x) > TAP_SLOP || Math.abs(t.clientY - from.y) > TAP_SLOP)
                return;
            stop(e);
            dismiss();
        };
        const onClick = (e) => {
            if (!outside)
                return;
            stop(e);
            dismiss();
        };
        const onKey = (e) => {
            tabbed = e.key === "Tab";
            // キーで押したボタンの click を、前の外側の押下として止めない
            outside = false;
            if (e.isComposing || e.keyCode === 229)
                return;
            const a = latest.current.anchor();
            if (e.key === "Escape") {
                stop(e);
                a?.focus({ preventScroll: true });
                self.close();
            }
            else if (e.key === "Enter" && a instanceof HTMLInputElement && e.target === a) {
                // 起点の入力の Enter: 確定して閉じるだけ（送信も、ほかの処理もしない）
                stop(e);
                self.close();
            }
        };
        const onFocusIn = (e) => {
            if (tabbed && !popupHas(e.target) && !anchorHas(e.target))
                self.close();
        };
        const capture = { capture: true };
        addEventListener("pointerdown", onPointerDown, capture);
        addEventListener("mousedown", onMouseDown, capture);
        addEventListener("touchend", onTouchEnd, { capture: true, passive: false });
        addEventListener("click", onClick, capture);
        addEventListener("contextmenu", onClick, capture);
        addEventListener("keydown", onKey, capture);
        addEventListener("focusin", onFocusIn, capture);
        document.addEventListener("scroll", place, { capture: true, passive: true });
        addEventListener("resize", place);
        window.visualViewport?.addEventListener("resize", place);
        window.visualViewport?.addEventListener("scroll", place);
        return () => {
            if (current === self)
                current = null;
            removeEventListener("pointerdown", onPointerDown, capture);
            removeEventListener("mousedown", onMouseDown, capture);
            removeEventListener("touchend", onTouchEnd, capture);
            removeEventListener("click", onClick, capture);
            removeEventListener("contextmenu", onClick, capture);
            removeEventListener("keydown", onKey, capture);
            removeEventListener("focusin", onFocusIn, capture);
            document.removeEventListener("scroll", place, capture);
            removeEventListener("resize", place);
            window.visualViewport?.removeEventListener("resize", place);
            window.visualViewport?.removeEventListener("scroll", place);
        };
    }, []);
    // 描くたびに置き直す（中身や起点の大きさが変わる）。上の showPopover のあとに走る
    useLayoutEffect(place);
    return (_jsx("div", { ref: ref, popover: "manual", "data-popup": "", tabIndex: -1, class: cls === undefined ? "ui-popup" : `ui-popup ${cls}`, role: label === undefined ? undefined : "dialog", "aria-label": label, children: children }));
}
