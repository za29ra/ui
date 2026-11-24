/**
 * 通知の状態の見出しと説明（DESIGN.md 4 章）。Preact を読まない純粋な部分（アプリの node --test から読めるように）。
 * アプリ別の部分（denied の説明に出すアプリの表示名、on の説明「何を知らせるか」）は引数で受ける
 */
import type { PushStatus } from "./push.ts";

/** 状態のアイコンの名前。アイコンそのものは NotifySettings の icons でアプリが渡す */
export type PushIconName = "alert" | "bell" | "bell-off";

export interface PushTextOptions {
  /** アプリの表示名（iOS の「設定」アプリの通知の一覧に出る名前） */
  appName: string;
  /** 通知を受け取っているときの説明（何を知らせるか） */
  onDetail: string;
}

/** 状態ごとの見出し・説明・アイコン。説明がアプリ別のものは関数 */
export const PUSH_STATES: Record<PushStatus, { title: string; detail: string | ((o: PushTextOptions) => string); icon: PushIconName }> = {
  unsupported: { title: "非対応のブラウザです", detail: "このブラウザは Push 通知に対応していません。", icon: "alert" },
  "needs-install": {
    title: "ホーム画面への追加が必要です",
    detail: "iPhone では、Safari の共有メニューから「ホーム画面に追加」して、そのアイコンから開くと通知を使えます。",
    icon: "alert",
  },
  denied: { title: "通知が許可されていません", detail: (o) => `iOS の「設定」アプリ → 通知 → ${o.appName} で許可してください。`, icon: "alert" },
  off: { title: "通知を受け取っていません", detail: "下のスイッチで、この端末への通知を始められます。", icon: "bell-off" },
  on: { title: "通知を受け取っています", detail: (o) => o.onDetail, icon: "bell" },
};

export function pushStateText(status: PushStatus, options: PushTextOptions): { title: string; detail: string; icon: PushIconName } {
  const s = PUSH_STATES[status];
  return { title: s.title, detail: typeof s.detail === "function" ? s.detail(options) : s.detail, icon: s.icon };
}
