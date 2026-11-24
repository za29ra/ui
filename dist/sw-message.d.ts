/**
 * Service Worker から画面へのメッセージ。通知をタップしたとき、開いているウィンドウに遷移を頼む（sw.ts の openOrFocus）
 */
/** 遷移の頼みなら開く URL（同じオリジンのパス）。形が違うもの・isAppPath が false のものは null */
export declare function navigatePath(data: unknown, isAppPath: (path: string) => boolean): string | null;
