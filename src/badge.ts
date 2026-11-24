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
export async function setBadge(nav: BadgeApi, count: number): Promise<void> {
  try {
    if (count > 0) await nav.setAppBadge?.(count);
    else await nav.clearAppBadge?.();
  } catch {
    // 権限がない・対応していない。バッジが出せなくても通知は出す
  }
}
