/**
 * ダイアログの共通の決まり。背景（dialog 自身）を押したときは、どのダイアログも閉じる。
 * 押し始めも背景のときだけ（文字を選ぶドラッグを外で離すと、click の対象は dialog になる）。
 * Esc は keydown で受ける（closesOnEscape）
 */
export function isBackdropClick(pressed, target, dialog) {
    return target !== null && target === dialog && pressed === dialog;
}
/**
 * この Esc で dialog を閉じる要求を出すか。host は押された要素の載った dialog（body などなら null）、top は開いている一番上の dialog。
 * cancel に任せない: Chrome は操作（クリックなど）を挟まない 2 回目の Esc の cancel を取り消せなくし、確認の dialog も編集の dialog も一度に閉じる
 */
export function closesOnEscape(e, dialog, host, top) {
    if (e.key !== "Escape" || e.defaultPrevented || e.isComposing || e.keyCode === 229)
        return false;
    return dialog === (host ?? top);
}
/** シートの上部（✕ のある帯）の高さ（ピクセル）。ここから始めた下向きのスワイプだけ閉じる */
export const SHEET_TOP = 64;
/** 下へこれだけ動いたら閉じる（ピクセル） */
export const DISMISS_MIN = 60;
/** 縦が横の何倍以上なら下向きのスワイプとみなすか */
export const DISMISS_RATIO = 1.5;
/** 指を置いた位置 y がシートの上部（シートの上端 top から SHEET_TOP まで）か */
export function inSheetTop(y, top) {
    return y >= top && y <= top + SHEET_TOP;
}
/** 指の動き (dx, dy) がシートを閉じる下向きのスワイプか */
export function isDismissSwipe(dx, dy) {
    return dy >= DISMISS_MIN && dy >= Math.abs(dx) * DISMISS_RATIO;
}
/**
 * キーボードが下から隠している高さ（ピクセル、0 以上）。iOS Safari では dvh がキーボードで縮まないので、
 * 見えている範囲（visualViewport の offsetTop から height 分）の下端からレイアウトの下端までを隠れているとみなす。
 * ピンチで拡大しているとき（scale > 1）は見えている範囲が狭いだけなので 0
 */
export function keyboardInset(innerHeight, vvHeight, vvOffsetTop, scale = 1) {
    if (scale > 1.01)
        return 0;
    return Math.max(0, Math.round(innerHeight - vvHeight - vvOffsetTop));
}
/**
 * シートの中で指が縦に dy 動いたとき、ブラウザの既定の動き（スクロール）を止めるか。
 * 指の下にスクロールできる要素（scroller）があり、その向きにまだ動けるときだけ通す。
 * それ以外を通すと、後ろのページや（iOS でキーボードが出ているときは）画面全体が動く
 */
export function blocksTouchScroll(dy, scroller) {
    if (dy === 0)
        return false;
    if (scroller === null)
        return true;
    // 指を下へ動かす（dy > 0）と上へスクロールする
    if (dy > 0)
        return scroller.scrollTop <= 0;
    return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
}
/** 指を置いてからこれ以内しか動いていなければタップとみなす（ピクセル） */
export const TAP_SLOP = 10;
/** キーボードで文字を打つ欄か（日付・時刻・チェックボックスなどは、それぞれの選び方が出るので含めない） */
export function isTextField(tag, type) {
    if (tag === "TEXTAREA")
        return true;
    return tag === "INPUT" && ["", "text", "search", "url", "email", "tel", "number", "password"].includes(type);
}
/**
 * 欄（top..bottom）を見えている範囲（viewTop..viewBottom）に出すために、本文の scrollTop を動かす量。
 * 下にはみ出していれば下端を合わせ、欄が範囲より高ければ上端を合わせる。収まっていれば 0
 */
export function revealDelta(top, bottom, viewTop, viewBottom) {
    if (top < viewTop)
        return top - viewTop;
    if (bottom > viewBottom)
        return Math.min(bottom - viewBottom, top - viewTop);
    return 0;
}
