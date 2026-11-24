/**
 * トーストの状態（DESIGN.md 3.4）。一度に 1 つ。新しいものが古いものに替わる。
 * Preact を読まない純粋な部分（アプリの node --test から読めるように）
 */
/** id のトーストを消す。別のトーストに替わっていたら、そちらを残す */
export function dismissToast(toast, id) {
    return toast?.id === id ? null : toast;
}
/** 消えるまでの時間の種類: sticky（時間で消さない）・action（10 秒）・plain（5 秒） */
export function toastKind(toast) {
    if (toast.sticky === true)
        return "sticky";
    return toast.action !== undefined ? "action" : "plain";
}
