/**
 * プルダウンで読み直す距離の計算（`pull-refresh.tsx` が使う）
 */
/** 画面に出す距離の上限（ピクセル） */
export declare const PULL_MAX = 96;
/** この距離まで引いて離すと更新する（ピクセル。指の動きは半分に縮めて見せる） */
export declare const PULL_TRIGGER = 56;
/** 指を置いた位置 startY から、今の位置 y まで引いたときの、画面に出す距離。上に動かしたら 0 */
export declare function pullDistance(startY: number, y: number): number;
export declare function pullReady(distance: number): boolean;
/** 引いた距離を 0〜1 にした進み（トリガーの距離で 1） */
export declare function pullProgress(distance: number): number;
/** 引いている間の矢印の向き（度）。0 は下向き、トリガーまで引くと 180（上向き）になって、離すと更新することを示す */
export declare function arrowAngle(distance: number): number;
/** 更新中の表示を、読み込みが速く終わっても最低限見せる時間（ミリ秒）。光って消えるだけにならないように */
export declare const REFRESH_MIN_MS = 600;
/** 読み込みが終わらなくても、更新中の表示を閉じる上限（ミリ秒）。回り続けないように */
export declare const REFRESH_MAX_MS = 8000;
/** 更新中の表示を閉じてよいか。startedAt は離した時刻、loading は一覧を読み込み中か */
export declare function refreshDone(now: number, startedAt: number, loading: boolean): boolean;
/** 縦横どちらの動きか決めるまでの、指の動きの最小量（ピクセル）。これより小さい間は決めない */
export declare const PULL_SLOP = 6;
/** 指の動き (dx, dy) が縦の引きか。決められないほど小さければ null、縦が横より大きければ true */
export declare function pullAxis(dx: number, dy: number): boolean | null;
export interface ScrollBox {
    overflowX: string;
    overflowY: string;
    scrollWidth: number;
    clientWidth: number;
    scrollHeight: number;
    clientHeight: number;
}
/** その要素が自分の中でスクロールできるか（overflow が auto / scroll で、中身がはみ出している）。ページ自体は呼び出し側で除く */
export declare function isScrollContainer(b: ScrollBox): boolean;
