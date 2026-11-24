import type { ComponentChildren } from "preact";
/** ボタンの並び。キャンセルの側 → その他 → 主の操作（右端。danger なら赤）の順に子を渡す */
export declare function DialogActions({ children }: {
    children: ComponentChildren;
}): import("preact").JSX.Element;
export interface ConfirmOptions {
    title: string;
    message?: string;
    /** 実行のボタンの文言 */
    label: string;
    /** やめるボタンの文言（既定は「やめる」） */
    cancel?: string;
    danger?: boolean;
}
/** 確認を出して、実行なら true・やめるなら false を返す。node を画面のどこかに置く */
export declare function useConfirm(): {
    ask(options: ConfirmOptions): Promise<boolean>;
    node: ComponentChildren;
};
/** 保存していない入力のあるシートを閉じるとき */
export declare const DISCARD_CONFIRM: ConfirmOptions;
/** guard の決まった形: 入力がなければ閉じ、あれば破棄するかを聞く */
export declare function discardGuard(dirty: boolean, ask: (o: ConfirmOptions) => Promise<boolean>): boolean | Promise<boolean>;
