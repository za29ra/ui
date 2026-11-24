/**
 * トーストの状態（DESIGN.md 3.4）。一度に 1 つ。新しいものが古いものに替わる。
 * Preact を読まない純粋な部分（アプリの node --test から読めるように）
 */
export interface ToastAction {
    label: string;
    run(): void;
}
export interface ToastState {
    /** 表示のたびに変わる（同じ文言が続いても消えるまでの時間をやり直すため） */
    id: number;
    text: string;
    action?: ToastAction;
    /** 時間で消さない（押すまで残す。新しい版の再読み込みなど） */
    sticky?: boolean;
}
export type Notify = (text: string, action?: ToastAction, sticky?: boolean) => void;
/** id のトーストを消す。別のトーストに替わっていたら、そちらを残す */
export declare function dismissToast(toast: ToastState | null, id: number): ToastState | null;
/** 消えるまでの時間の種類: sticky（時間で消さない）・action（10 秒）・plain（5 秒） */
export declare function toastKind(toast: ToastState): "plain" | "action" | "sticky";
