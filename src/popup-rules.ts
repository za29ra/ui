/**
 * 欄に接する popup の決まり（位置と、押した所の分け方）。DOM の読み書きは popup.tsx。
 * 座標は画面（position: fixed）の px
 */

/** 欄と popup の間 */
export const POPUP_GAP = 4;
/** 画面の端に空ける幅 */
export const POPUP_EDGE = 8;

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
export function visibleView(seen: View, screenHeight: number, safe: { top: number; bottom: number }): View {
  const top = Math.max(seen.top, safe.top);
  const bottom = Math.min(seen.top + seen.height, screenHeight - safe.bottom);
  return { ...seen, top, height: bottom - top };
}

/** 上下とも狭いときに、欄に重ねてでも確保する一覧の高さ */
const MIN_LIST_HEIGHT = 160;

/**
 * 高さの上限。ふつうは見えている範囲。beside（長い一覧）は欄の上下の広いほうに収め、中をスクロールさせる
 * （起点の行が隠れると、どの項目を選んでいるか分からない）。端数で入らなくならないよう切り捨てる
 */
export function popupMaxHeight(anchor: Edges, view: View, beside: boolean): number {
  const all = view.height - 2 * POPUP_EDGE;
  if (!beside) return all;
  const below = view.top + view.height - POPUP_EDGE - (anchor.bottom + POPUP_GAP);
  const above = anchor.top - POPUP_GAP - (view.top + POPUP_EDGE);
  return Math.floor(Math.min(all, Math.max(below, above, MIN_LIST_HEIGHT)));
}

/** 一覧の矢印・Home・End で移る先。ほかのキーは null */
export function pickStep(index: number, count: number, key: string): number | null {
  switch (key) {
    case "ArrowDown":
      return Math.min(count - 1, index + 1);
    case "ArrowUp":
      return Math.max(0, index - 1);
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/** 欄の下に左を揃える。右に入らなければ右を揃え、下に入らなければ上。どちらも無理なら見えている範囲に収める */
export function placePopup(anchor: Edges, size: Size, view: View): { left: number; top: number } {
  const minX = view.left + POPUP_EDGE;
  const minY = view.top + POPUP_EDGE;
  const maxX = view.left + view.width - POPUP_EDGE - size.width;
  const maxY = view.top + view.height - POPUP_EDGE - size.height;
  const x = anchor.left <= maxX ? anchor.left : anchor.right - size.width;
  const below = anchor.bottom + POPUP_GAP;
  const above = anchor.top - POPUP_GAP - size.height;
  const y = below <= maxY ? below : above >= minY ? above : maxY;
  return { left: Math.max(minX, Math.min(x, maxX)), top: Math.max(minY, Math.min(y, maxY)) };
}

/**
 * 押した所: inside（popup の中か、その popup を開いた欄）・switch（ほかの popup を開く欄。そちらに切り替わる）・
 * outside（閉じるだけ。押した先は動かさない）
 */
export function pressKind(at: { inPopup: boolean; inAnchor: boolean; inTrigger: boolean }): "inside" | "switch" | "outside" {
  if (at.inPopup || at.inAnchor) return "inside";
  return at.inTrigger ? "switch" : "outside";
}
