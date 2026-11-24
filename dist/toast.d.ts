import { type Notify, type ToastState } from "./toast-state.ts";
export * from "./toast-state.ts";
export declare function useToastState(): {
    toast: ToastState | null;
    notify: Notify;
    dismiss(id: number): void;
};
export declare function Toast({ toast, onClose }: {
    toast: ToastState | null;
    onClose(id: number): void;
}): import("preact").JSX.Element;
