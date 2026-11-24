import { type ComponentChildren, type RefObject } from "preact";
export interface ModalProps {
    open: boolean;
    /** 閉じたとき（Esc・背景・close() のどれでも） */
    onClose(): void;
    /** 中のボタンから close() を呼びたいときの ref */
    dialogRef?: RefObject<HTMLDialogElement | null>;
    /** シートの振る舞い（上部のスワイプ・ページのスクロールを止める・高さの動き）と ui-sheet の class を付けるか。既定は true。右クリックのメニューなどは false にして、class と style（位置）を渡す */
    sheet?: boolean;
    /** ui-sheet の後ろに足す class（sheet が false なら、これだけ） */
    class?: string;
    style?: string;
    /** 閉じる要求のたびに呼ぶ。false なら閉じない */
    guard?: CloseGuard;
    children: ComponentChildren;
}
/** 閉じてよいか（確認を出すなら、答えを待つ） */
export type CloseGuard = () => boolean | Promise<boolean>;
/** 載っている Modal の閉じる要求に、確認を差し込む（Modal の中の部品から。読み込みのある編集など、入力の状態を中で持つもの） */
export declare function useCloseGuard(guard: CloseGuard): void;
export declare function Modal({ open, onClose, dialogRef, sheet, class: cls, style, guard, children }: ModalProps): import("preact").JSX.Element;
/** シートの閉じるボタン。左上の ✕ に統一（やめるボタンは置かない）。✕ は ui-ico-close */
export declare function SheetClose({ dialogRef }: {
    dialogRef: RefObject<HTMLDialogElement | null>;
}): import("preact").JSX.Element;
