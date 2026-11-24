import { test } from "node:test";
import assert from "node:assert/strict";
import { pushStateText } from "../src/settings-text.ts";

test("通知の状態の見出しと説明（DESIGN.md 4 章）", () => {
  const t = (s: Parameters<typeof pushStateText>[0]) => pushStateText(s, { appName: "Demo", onDetail: "毎朝お知らせします。" });
  assert.equal(t("needs-install").title, "ホーム画面への追加が必要です");
  assert.equal(t("needs-install").detail, "iPhone では、Safari の共有メニューから「ホーム画面に追加」して、そのアイコンから開くと通知を使えます。");
  assert.match(t("denied").detail, /Demo/);
  assert.equal(t("on").detail, "毎朝お知らせします。");
  for (const s of ["unsupported", "needs-install", "denied", "off", "on"] as const) assert.ok(t(s).title.length > 0);
});
