/**
 * ホーム画面のアイコンのバッジ（数えるものはアプリ別）。画面と Service Worker の両方から使う。
 * iOS では通知の権限がないと使えない
 */
/** navigator のバッジ API のうち使う部分（対応していない環境では欠ける） */
export interface BadgeApi {
    setAppBadge?(count?: number): Promise<void>;
    clearAppBadge?(): Promise<void>;
}
/** 0 より大きければ件数を付け、0 なら消す。対応していない・権限がないときは何もしない（投げない） */
export declare function setBadge(nav: BadgeApi, count: number): Promise<void>;
