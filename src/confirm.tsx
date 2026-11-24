/**
 * 確認のダイアログと、ダイアログの下のボタンの並び（DESIGN.md 2.4）。
 * - 見出しは h2、ボタンの並びは DialogActions: 右寄せの横並びで、キャンセルの側 → 主の操作（右端）
 * - 危ない操作（削除）は主の操作の位置に danger で置き、最初のフォーカスはキャンセルの側に置く
 */
import { useId, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { Modal } from "./modal.tsx";

/** ボタンの並び。キャンセルの側 → その他 → 主の操作（右端。danger なら赤）の順に子を渡す */
export function DialogActions({ children }: { children: ComponentChildren }) {
  return <div class="ui-dialog-actions">{children}</div>;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** 実行のボタンの文言 */
  label: string;
  /** やめるボタンの文言（既定は「やめる」） */
  cancel?: string;
  danger?: boolean;
}

interface Pending extends ConfirmOptions {
  resolve(ok: boolean): void;
}

/** 確認を出して、実行なら true・やめるなら false を返す。node を画面のどこかに置く */
export function useConfirm(): { ask(options: ConfirmOptions): Promise<boolean>; node: ComponentChildren } {
  const [pending, setPending] = useState<Pending | null>(null);
  const current = useRef<Pending | null>(null);
  current.current = pending;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  const finish = (ok: boolean) => {
    const p = current.current;
    if (p === null) return;
    current.current = null;
    setPending(null);
    p.resolve(ok);
  };

  const ask = (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve }));

  const danger = pending?.danger === true;
  const node = (
    <Modal open={pending !== null} onClose={() => finish(false)} dialogRef={dialogRef}>
      {pending !== null && (
        <div class="ui-confirm" role="alertdialog" aria-labelledby={titleId} aria-describedby={pending.message !== undefined ? messageId : undefined}>
          <h2 id={titleId}>{pending.title}</h2>
          {pending.message !== undefined && (
            <p id={messageId} class="ui-confirm-message">
              {pending.message}
            </p>
          )}
          <DialogActions>
            {/* フォームのシートの中に置いても、送信にならないように type="button"。危ない確認では、うっかり実行しないようキャンセルの側にフォーカスする */}
            <button type="button" autofocus={danger} onClick={() => dialogRef.current?.close()}>
              {pending.cancel ?? "やめる"}
            </button>
            <button type="button" class={danger ? "ui-danger" : "ui-primary"} autofocus={!danger} onClick={() => finish(true)}>
              {pending.label}
            </button>
          </DialogActions>
        </div>
      )}
    </Modal>
  );
  return { ask, node };
}

/** 保存していない入力のあるシートを閉じるとき */
export const DISCARD_CONFIRM: ConfirmOptions = { title: "変更を破棄しますか？", message: "保存していない入力は消えます。", label: "破棄する", cancel: "続ける", danger: true };

/** guard の決まった形: 入力がなければ閉じ、あれば破棄するかを聞く */
export function discardGuard(dirty: boolean, ask: (o: ConfirmOptions) => Promise<boolean>): boolean | Promise<boolean> {
  return !dirty || ask(DISCARD_CONFIRM);
}
