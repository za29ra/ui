/**
 * ダイアログの共通の決まり。背景（dialog 自身）を押したときは、どのダイアログも閉じる。
 * 押し始めも背景のときだけ（文字を選ぶドラッグを外で離すと、click の対象は dialog になる）。
 * Esc は keydown で受ける（closesOnEscape）
 */
export declare function isBackdropClick(pressed: unknown, target: unknown, dialog: unknown): boolean;
/**
 * この Esc で dialog を閉じる要求を出すか。host は押された要素の載った dialog（body などなら null）、top は開いている一番上の dialog。
 * cancel に任せない: Chrome は操作（クリックなど）を挟まない 2 回目の Esc の cancel を取り消せなくし、確認の dialog も編集の dialog も一度に閉じる
 */
export declare function closesOnEscape(e: {
    key: string;
    defaultPrevented: boolean;
    isComposing: boolean;
    keyCode: number;
}, dialog: unknown, host: unknown, top: unknown): boolean;
/** シートの上部（✕ のある帯）の高さ（ピクセル）。ここから始めた下向きのスワイプだけ閉じる */
export declare const SHEET_TOP = 64;
/** 下へこれだけ動いたら閉じる（ピクセル） */
export declare const DISMISS_MIN = 60;
/** 縦が横の何倍以上なら下向きのスワイプとみなすか */
export declare const DISMISS_RATIO = 1.5;
/** 指を置いた位置 y がシートの上部（シートの上端 top から SHEET_TOP まで）か */
export declare function inSheetTop(y: number, top: number): boolean;
/** 指の動き (dx, dy) がシートを閉じる下向きのスワイプか */
export declare function isDismissSwipe(dx: number, dy: number): boolean;
/**
 * キーボードが下から隠している高さ（ピクセル、0 以上）。iOS Safari では dvh がキーボードで縮まないので、
 * 見えている範囲（visualViewport の offsetTop から height 分）の下端からレイアウトの下端までを隠れているとみなす。
 * ピンチで拡大しているとき（scale > 1）は見えている範囲が狭いだけなので 0
 */
export declare function keyboardInset(innerHeight: number, vvHeight: number, vvOffsetTop: number, scale?: number): number;
/** スクロールできる要素の今の位置（scroller の判定に使う分だけ） */
export interface ScrollBox {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
}
/**
 * シートの中で指が縦に dy 動いたとき、ブラウザの既定の動き（スクロール）を止めるか。
 * 指の下にスクロールできる要素（scroller）があり、その向きにまだ動けるときだけ通す。
 * それ以外を通すと、後ろのページや（iOS でキーボードが出ているときは）画面全体が動く
 */
export declare function blocksTouchScroll(dy: number, scroller: ScrollBox | null): boolean;
/** 指を置いてからこれ以内しか動いていなければタップとみなす（ピクセル） */
export declare const TAP_SLOP = 10;
/** キーボードで文字を打つ欄か（日付・時刻・チェックボックスなどは、それぞれの選び方が出るので含めない） */
export declare function isTextField(tag: string, type: string): boolean;
/**
 * 欄（top..bottom）を見えている範囲（viewTop..viewBottom）に出すために、本文の scrollTop を動かす量。
 * 下にはみ出していれば下端を合わせ、欄が範囲より高ければ上端を合わせる。収まっていれば 0
 */
export declare function revealDelta(top: number, bottom: number, viewTop: number, viewBottom: number): number;
