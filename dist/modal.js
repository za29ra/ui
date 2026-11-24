import { jsx as _jsx } from "preact/jsx-runtime";
/**
 * ダイアログの共通の部品。シート・確認のダイアログが同じ作りになる（右クリックのメニューなども、これの上に作る）。
 * - 背景を押す・Esc で閉じる。シートは上部（✕ の帯）から下へスワイプしても閉じる（ダイアログの形では閉じない）。シートは左上の SheetClose（確認のダイアログだけ、答えの一つとして「やめる」を置く）
 * - ✕・背景・Esc・スワイプは同じ「閉じる要求」。guard（または中の useCloseGuard）が false を返したら閉じない（未保存の入力の確認）。
 *   保存のあとなどに中から close() を呼んだときは確かめない
 * - popup（popup.tsx）が開いているあいだは、cancel は popup だけを閉じ、スワイプは始めない
 * - Esc は keydown で止めて、閉じる要求にする（modal-rules.ts の closesOnEscape）。cancel はキー以外の閉じる操作（Android の戻るなど）のために残す
 */
import { useContext, useEffect, useRef } from "preact/hooks";
import { createContext } from "preact";
import { blocksTouchScroll, closesOnEscape, inSheetTop, isBackdropClick, isDismissSwipe, isTextField, TAP_SLOP } from "./modal-rules.js";
import { isDialogLayout } from "./dialog-layout.js";
import { closePopup, hasPopup } from "./popup.js";
const CloseContext = createContext(null);
/** 載っている Modal の閉じる要求に、確認を差し込む（Modal の中の部品から。読み込みのある編集など、入力の状態を中で持つもの） */
export function useCloseGuard(guard) {
    const control = useContext(CloseContext);
    const latest = useRef(guard);
    latest.current = guard;
    useEffect(() => {
        if (control === null)
            return;
        control.setGuard(() => latest.current());
        return () => control.setGuard(null);
    }, [control]);
}
export function Modal({ open, onClose, dialogRef, sheet = true, class: cls = "", style, guard, children }) {
    const own = useRef(null);
    const ref = dialogRef ?? own;
    /** 上部から始めた指の位置（シートだけ。メニューなどは見ない） */
    const swipe = useRef(null);
    /** 指を置いた位置と直前の y（シートの中のスクロールを、後ろに伝えないための判定） */
    const touch = useRef({ x: 0, y: 0, lastY: 0 });
    /** 最後にタップで自分でフォーカスした欄（autofocus でフォーカスだけ済んでいる欄と見分ける） */
    const tapped = useRef(null);
    /** 押し始めた要素（背景で押し始めたかの判定） */
    const pressed = useRef(null);
    const isSheet = sheet;
    const classes = (sheet ? `ui-sheet ${cls}` : cls).trim();
    /** 中の部品が useCloseGuard で差し込んだ確認 */
    const inner = useRef(null);
    /** 確認の答えを待っているあいだ（重ねて聞かない） */
    const asking = useRef(false);
    const requestClose = async () => {
        const d = ref.current;
        if (d === null || !d.open || asking.current)
            return;
        const g = inner.current ?? guard;
        if (g !== undefined) {
            // 指で下げたままにせず、戻してから聞く
            settle(d);
            asking.current = true;
            try {
                if (!(await g()))
                    return;
            }
            finally {
                asking.current = false;
            }
        }
        d.close();
    };
    const latestRequest = useRef(requestClose);
    latestRequest.current = requestClose;
    const control = useRef({ request: () => void latestRequest.current(), setGuard: (g) => (inner.current = g) }).current;
    useEffect(() => {
        const d = ref.current;
        if (open && !d.open) {
            d.showModal();
            // 欄に autofocus がなければ、ブラウザは先頭の ✕ にフォーカスしてリングが出る。dialog 自身に移す（Tab で ✕ に移れば出る）
            if (document.activeElement instanceof HTMLElement && document.activeElement.classList.contains("ui-sheet-close"))
                d.focus();
        }
        if (!open && d.open)
            d.close();
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        // フォーカスが body に落ちていても受けられるよう document で聞く。アプリが capture で受けるキーの処理は先に済む
        const onKey = (e) => {
            const host = e.target instanceof Element ? e.target.closest("dialog") : null;
            const top = [...document.querySelectorAll("dialog[open]")].at(-1) ?? null;
            if (!closesOnEscape(e, ref.current, host, top))
                return;
            e.preventDefault();
            // 押しっぱなしで、出た確認まで閉じない
            if (!e.repeat)
                latestRequest.current();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);
    useEffect(() => (open && isSheet ? lockPageScroll() : undefined), [open]);
    useEffect(() => (isSheet ? animateHeight(ref.current) : undefined), []);
    return (_jsx("dialog", { ref: ref, class: classes, style: style, tabIndex: -1, onClose: () => {
            settle(ref.current, true);
            onClose();
        }, onCancel: (e) => {
            // キー以外の閉じる操作（Esc は上の keydown で止めている）。取り消せないとき（Chrome は続けて取り消すと、次は取り消せなくする）はそのまま閉じる
            if (!e.cancelable)
                return;
            e.preventDefault();
            if (closePopup(ref.current))
                return;
            void requestClose();
        }, onPointerDown: (e) => (pressed.current = e.target), onClick: (e) => isBackdropClick(pressed.current, e.target, ref.current) && void requestClose(), onContextMenu: (e) => {
            if (isBackdropClick(pressed.current, e.target, ref.current)) {
                e.preventDefault();
                void requestClose();
            }
        }, onTouchStart: isSheet ? (e) => {
            const t = e.touches[0];
            swipe.current = e.touches.length === 1 && !isDialogLayout() && !hasPopup(ref.current) && inSheetTop(t.clientY, ref.current.getBoundingClientRect().top) ? { x: t.clientX, y: t.clientY } : null;
            touch.current = { x: t.clientX, y: t.clientY, lastY: t.clientY };
            ref.current.style.transition = "none";
        } : undefined, onTouchMove: isSheet ? (e) => {
            const s = swipe.current;
            const t = e.touches[0];
            const step = t.clientY - touch.current.lastY;
            touch.current.lastY = t.clientY;
            if (s !== null) {
                const dy = t.clientY - s.y;
                // 縦の動きが主のときだけ指に合わせて下げる（上へは動かさない）
                if (dy > 0 && dy >= Math.abs(t.clientX - s.x)) {
                    if (e.cancelable)
                        e.preventDefault();
                    ref.current.style.transform = `translateY(${dy}px)`;
                    return;
                }
            }
            // 縦の動きで、本文などがその向きに動けないときは止める（後ろのページや、iOS でキーボードが出ているときの画面全体が動く）。
            // 横の動き（横に流れる並びのスクロール）は通す
            const vertical = Math.abs(t.clientY - touch.current.y) >= Math.abs(t.clientX - touch.current.x);
            if (vertical && e.touches.length === 1 && e.cancelable && blocksTouchScroll(step, scrollerOf(e.target, ref.current)))
                e.preventDefault();
        } : undefined, onTouchEnd: isSheet ? (e) => {
            const s = swipe.current;
            swipe.current = null;
            const d = ref.current;
            const t = e.changedTouches[0];
            if (s !== null && isDismissSwipe(t.clientX - s.x, t.clientY - s.y))
                void requestClose();
            else
                settle(d);
            // まだタップでフォーカスしていない文字の欄をタップしたら、自分でフォーカスする。iOS の標準のフォーカスは欄を見せようと画面全体をずらし、
            // シートごと上下に揺れて見える。欄を見せるのは SheetFrame（本文のスクロール）に任せる。
            // autofocus の欄でキーボードが出ていないときは、フォーカスだけ済んでいるので、一度外してからフォーカスし直す
            // （キーボードが出ていれば、文字の位置を選べるようブラウザに任せる）
            const el = e.target;
            const tap = Math.abs(t.clientX - touch.current.x) <= TAP_SLOP && Math.abs(t.clientY - touch.current.y) <= TAP_SLOP;
            if (tap && e.cancelable && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && isTextField(el.tagName, el.type) && !el.disabled && (document.activeElement !== el || (tapped.current !== el && !d.classList.contains("ui-keyboard")))) {
                e.preventDefault();
                if (document.activeElement === el)
                    el.blur();
                el.focus({ preventScroll: true });
                tapped.current = el;
            }
        } : undefined, onTouchCancel: isSheet ? () => {
            swipe.current = null;
            settle(ref.current);
        } : undefined, children: _jsx(CloseContext.Provider, { value: control, children: open && children }) }));
}
/** 開いているシートの数と、開く前のページのスクロール位置 */
let pageLocks = 0;
let pageY = 0;
/**
 * シートを開いているあいだ、後ろのページを今の位置に留める（閉じる関数を返す。シートを重ねても、最後に閉じたときに外す）。
 * iOS は入力欄にフォーカスするたびにページをスクロールして欄を見せようとし、overflow: hidden でも後ろの一覧がずれていくので、
 * スクロールされたら戻す（body を fixed にすると、後ろの sticky のヘッダーがずれる）
 */
function lockPageScroll() {
    if (pageLocks++ === 0) {
        pageY = scrollY;
        addEventListener("scroll", keepPage);
    }
    return () => {
        if (--pageLocks > 0)
            return;
        removeEventListener("scroll", keepPage);
    };
}
function keepPage() {
    if (scrollY !== pageY)
        scrollTo(0, pageY);
}
/** target から dialog までのあいだで、縦にスクロールできる一番近い要素（本文・メモ欄など） */
function scrollerOf(target, dialog) {
    for (let el = target instanceof HTMLElement ? target : null; el !== null && el !== dialog; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1)
            continue;
        const y = getComputedStyle(el).overflowY;
        if (y === "auto" || y === "scroll")
            return el;
    }
    return null;
}
/** 指で下げた分を戻す（reset なら動かさずに外す） */
function settle(d, reset = false) {
    d.style.transition = reset ? "none" : "transform 0.2s ease-out";
    d.style.transform = "";
}
/** シートの閉じるボタン。左上の ✕ に統一（やめるボタンは置かない）。✕ は ui-ico-close */
export function SheetClose({ dialogRef }) {
    const control = useContext(CloseContext);
    return (_jsx("button", { type: "button", class: "ui-icon ui-sheet-close", "aria-label": "\u9589\u3058\u308B", onClick: () => (control === null ? dialogRef.current?.close() : control.request()), children: _jsx("span", { class: "ui-ico ui-ico-close", "aria-hidden": "true" }) }));
}
/**
 * シートの高さが中身で変わったとき（選んだ値で欄が増えるなど）、前の高さから新しい高さへ動かす。
 * 高さが決まっているシートは変わらないので動かない。キーボードの出入りによる変化と、動きを減らす設定のときは動かさない。
 * 戻り値は後始末
 */
function animateHeight(d) {
    if (typeof ResizeObserver === "undefined")
        return () => { };
    const DURATION_MS = 250;
    let prev = null;
    let keyboard = false;
    let animating = false;
    let timer;
    const finish = () => {
        clearTimeout(timer);
        d.style.transition = "";
        d.style.height = "";
        animating = false;
        prev = d.offsetHeight;
    };
    const ro = new ResizeObserver(() => {
        if (animating)
            return;
        const h = d.offsetHeight;
        const kb = d.classList.contains("ui-keyboard");
        const from = prev;
        const still = kb !== keyboard;
        prev = h;
        keyboard = kb;
        // 閉じているあいだ（高さ 0）・初めて測ったとき・キーボードの出入り・ほぼ同じ高さは、そのまま
        if (h === 0 || from === null || from === 0 || still || Math.abs(h - from) < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        animating = true;
        d.style.transition = "none";
        d.style.height = `${from}px`;
        void d.offsetHeight;
        d.style.transition = `height ${DURATION_MS}ms ease`;
        d.style.height = `${h}px`;
        d.addEventListener("transitionend", finish, { once: true });
        timer = setTimeout(finish, DURATION_MS + 100);
    });
    ro.observe(d);
    return () => {
        ro.disconnect();
        clearTimeout(timer);
    };
}
