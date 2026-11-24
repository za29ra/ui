/**
 * 通知の状態の見出しと説明（DESIGN.md 4 章）。Preact を読まない純粋な部分（アプリの node --test から読めるように）。
 * アプリ別の部分（denied の説明に出すアプリの表示名、on の説明「何を知らせるか」）は引数で受ける
 */
import type { PushStatus } from "./push.ts";
/** 状態のアイコンの名前。NotifySettings は ui-ico-<名前> で描く */
export type PushIconName = "alert" | "bell" | "bell-off";
export interface PushTextOptions {
    /** アプリの表示名（iOS の「設定」アプリの通知の一覧に出る名前） */
    appName: string;
    /** 通知を受け取っているときの説明（何を知らせるか） */
    onDetail: string;
}
/** 状態ごとの見出し・説明・アイコン。説明がアプリ別のものは関数 */
export declare const PUSH_STATES: Record<PushStatus, {
    title: string;
    detail: string | ((o: PushTextOptions) => string);
    icon: PushIconName;
}>;
export declare function pushStateText(status: PushStatus, options: PushTextOptions): {
    title: string;
    detail: string;
    icon: PushIconName;
};
