/**
 * プルダウンで読み直す距離の計算（`pull-refresh.tsx` が使う）
 */

/** 画面に出す距離の上限（ピクセル） */
export const PULL_MAX = 96;

/** この距離まで引いて離すと更新する（ピクセル。指の動きは半分に縮めて見せる） */
export const PULL_TRIGGER = 56;

/** 指を置いた位置 startY から、今の位置 y まで引いたときの、画面に出す距離。上に動かしたら 0 */
export function pullDistance(startY: number, y: number): number {
  return Math.min(PULL_MAX, Math.max(0, (y - startY) / 2));
}

export function pullReady(distance: number): boolean {
  return distance >= PULL_TRIGGER;
}

/** 引いた距離を 0〜1 にした進み（トリガーの距離で 1） */
export function pullProgress(distance: number): number {
  return Math.min(1, Math.max(0, distance / PULL_TRIGGER));
}

/** 引いている間の矢印の向き（度）。0 は下向き、トリガーまで引くと 180（上向き）になって、離すと更新することを示す */
export function arrowAngle(distance: number): number {
  return pullProgress(distance) * 180;
}

/** 更新中の表示を、読み込みが速く終わっても最低限見せる時間（ミリ秒）。光って消えるだけにならないように */
export const REFRESH_MIN_MS = 600;

/** 読み込みが終わらなくても、更新中の表示を閉じる上限（ミリ秒）。回り続けないように */
export const REFRESH_MAX_MS = 8000;

/** 更新中の表示を閉じてよいか。startedAt は離した時刻、loading は一覧を読み込み中か */
export function refreshDone(now: number, startedAt: number, loading: boolean): boolean {
  const elapsed = now - startedAt;
  return elapsed >= REFRESH_MAX_MS || (elapsed >= REFRESH_MIN_MS && !loading);
}

/** 縦横どちらの動きか決めるまでの、指の動きの最小量（ピクセル）。これより小さい間は決めない */
export const PULL_SLOP = 6;

/** 指の動き (dx, dy) が縦の引きか。決められないほど小さければ null、縦が横より大きければ true */
export function pullAxis(dx: number, dy: number): boolean | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < PULL_SLOP) return null;
  return Math.abs(dy) > Math.abs(dx);
}

export interface ScrollBox {
  overflowX: string;
  overflowY: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
}

/** その要素が自分の中でスクロールできるか（overflow が auto / scroll で、中身がはみ出している）。ページ自体は呼び出し側で除く */
export function isScrollContainer(b: ScrollBox): boolean {
  const scrolls = (v: string) => v === "auto" || v === "scroll" || v === "overlay";
  return (scrolls(b.overflowY) && b.scrollHeight > b.clientHeight) || (scrolls(b.overflowX) && b.scrollWidth > b.clientWidth);
}
