/**
 * Service Worker から画面へのメッセージ。通知をタップしたとき、開いているウィンドウに遷移を頼む（sw.ts の openOrFocus）
 */

/** 遷移の頼みなら開く URL（同じオリジンのパス）。形が違うもの・isAppPath が false のものは null */
export function navigatePath(data: unknown, isAppPath: (path: string) => boolean): string | null {
  if (data === null || typeof data !== "object") return null;
  const d = data as { type?: unknown; path?: unknown };
  if (d.type !== "navigate" || typeof d.path !== "string") return null;
  return isAppPath(d.path) ? d.path : null;
}
