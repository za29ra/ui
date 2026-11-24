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
export declare function useToastState(): {
    toast: ToastState | null;
    notify: Notify;
    dismiss(id: number): void;
};
