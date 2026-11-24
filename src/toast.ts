/**
 * トーストの状態（DESIGN.md 3.4）。一度に 1 つ。新しいものが古いものに替わる
 */
import { useRef, useState } from "preact/hooks";

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

export function useToastState(): { toast: ToastState | null; notify: Notify; dismiss(id: number): void } {
  const [toast, setToast] = useState<ToastState | null>(null);
  const seq = useRef(0);
  const notify: Notify = (text, action, sticky) => setToast({ id: ++seq.current, text, action, sticky });
  const dismiss = (id: number) => setToast((t) => (t?.id === id ? null : t));
  return { toast, notify, dismiss };
}
