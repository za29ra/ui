/**
 * 消えずに残る知らせと、それへの操作（DESIGN.md 2.1・4 章）。見た目は components.css の .ui-banner。
 * - 保存の食い違いのように、選ぶまで消せないもの。すぐ消えてよい知らせはトースト（ui/toast）
 *   <Banner kind="danger" message="ほかの端末で変わっています" actions={[{ label: "最新を読み込む", onClick: reload }, { label: "手元の内容で上書き", onClick: overwrite }]} />
 * - 置き場所はアプリ（画面の上か、食い違った中身の上）。ui は外の余白も位置も決めない
 * - role="alert" なので、出たときに読み上げる。出しっぱなしにせず、選んだら消す
 */
import type { ComponentChildren } from "preact";

export interface BannerAction {
  label: ComponentChildren;
  onClick(): void;
  /** 並びの key（既定は並びの位置） */
  key?: string;
}

export interface BannerProps {
  message: ComponentChildren;
  /** ボタンは既定の見た目（主の操作の色にしない） */
  actions: BannerAction[];
  /** danger: 枠を赤にする（食い違い・失敗） */
  kind?: "danger";
  /** ui-banner の後ろに足す class */
  class?: string;
}

export function Banner({ message, actions, kind, class: cls = "" }: BannerProps) {
  return (
    <div class={`ui-banner ${cls}`.trim()} data-kind={kind} role="alert">
      <p class="ui-banner-text">{message}</p>
      <div class="ui-banner-actions">
        {actions.map((a, i) => (
          <button key={a.key ?? i} type="button" onClick={() => a.onClick()}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
