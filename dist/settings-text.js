/** 状態ごとの見出し・説明・アイコン。説明がアプリ別のものは関数 */
export const PUSH_STATES = {
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
export function pushStateText(status, options) {
    const s = PUSH_STATES[status];
    return { title: s.title, detail: typeof s.detail === "function" ? s.detail(options) : s.detail, icon: s.icon };
}
