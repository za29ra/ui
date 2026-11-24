import { test } from "node:test";
import assert from "node:assert/strict";
import { navigatePath } from "../src/sw-message.ts";

const isAppPath = (p: string) => p.startsWith("/") && !p.startsWith("//");

test("遷移の頼みなら、同じオリジンのパスを返す。形が違うもの・別のオリジンは null", () => {
  assert.equal(navigatePath({ type: "navigate", path: "/?task=7" }, isAppPath), "/?task=7");
  assert.equal(navigatePath({ type: "navigate", path: "/" }, isAppPath), "/");
  for (const d of [null, "x", {}, { type: "other", path: "/" }, { type: "navigate" }, { type: "navigate", path: 1 }, { type: "navigate", path: "//evil.example/" }, { type: "navigate", path: "https://evil.example/" }]) {
    assert.equal(navigatePath(d, isAppPath), null, JSON.stringify(d));
  }
});

test("アプリの検査が false を返すパスは null", () => {
  assert.equal(navigatePath({ type: "navigate", path: "/admin" }, (p) => p !== "/admin"), null);
});
