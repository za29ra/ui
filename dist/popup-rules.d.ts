/**
 * 欄に接する popup の決まり（位置と、押した所の分け方）。DOM の読み書きは popup.tsx。
 * 座標は画面（position: fixed）の px
 */
/** 欄と popup の間 */
export declare const POPUP_GAP = 4;
/** 画面の端に空ける幅 */
export declare const POPUP_EDGE = 8;
export interface Edges {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface Size {
    width: number;
    height: number;
}
/** 見えている範囲（visualViewport） */
export interface View extends Size {
    left: number;
    top: number;
}
/**
 * popup を置ける範囲: 見えている範囲（seen）から、安全領域（ステータスバー・ホームバー）に掛かる分を除く。
 * キーボードやずれでもう見えていない分は除かない。screenHeight は画面（position: fixed の基準）の高さ
 */
export declare function visibleView(seen: View, screenHeight: number, safe: {
    top: number;
    bottom: number;
}): View;
/**
 * 高さの上限。ふつうは見えている範囲。beside（長い一覧）は欄の上下の広いほうに収め、中をスクロールさせる
 * （起点の行が隠れると、どの項目を選んでいるか分からない）。端数で入らなくならないよう切り捨てる
 */
export declare function popupMaxHeight(anchor: Edges, view: View, beside: boolean): number;
/** 一覧の矢印・Home・End で移る先。ほかのキーは null */
export declare function pickStep(index: number, count: number, key: string): number | null;
/** 欄の下に左を揃える。右に入らなければ右を揃え、下に入らなければ上。どちらも無理なら見えている範囲に収める */
export declare function placePopup(anchor: Edges, size: Size, view: View): {
    left: number;
    top: number;
};
/**
 * 押した所: inside（popup の中か、その popup を開いた欄）・switch（ほかの popup を開く欄。そちらに切り替わる）・
 * outside（閉じるだけ。押した先は動かさない）
 */
export declare function pressKind(at: {
    inPopup: boolean;
    inAnchor: boolean;
    inTrigger: boolean;
}): "inside" | "switch" | "outside";
