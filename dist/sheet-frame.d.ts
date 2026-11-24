import type { ComponentChildren, RefObject } from "preact";
export interface SheetFrameProps {
    dialogRef: RefObject<HTMLDialogElement | null>;
    title?: ComponentChildren;
    subtitle?: ComponentChildren;
    right?: ComponentChildren;
    /** undefined ならフッターなし。null なら場所だけ */
    footer?: ComponentChildren;
    onSubmit?(): void;
    label?: string;
    /** ✕ のアイコンを差し替える（SheetClose の icon） */
    closeIcon?: ComponentChildren;
    children: ComponentChildren;
}
export declare function SheetFrame({ dialogRef, title, subtitle, right, footer, onSubmit, label, closeIcon, children }: SheetFrameProps): import("preact").JSX.Element;
