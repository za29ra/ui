import { test } from "node:test";
import assert from "node:assert/strict";
import { dismissToast, toastKind } from "../src/toast-state.ts";

test("id のトーストだけを消す。別のトーストに替わっていたら残す", () => {
  const t = { id: 2, text: "b" };
  assert.equal(dismissToast(t, 2), null);
  assert.equal(dismissToast(t, 1), t);
  assert.equal(dismissToast(null, 1), null);
});

test("種類: sticky が先、次に操作のあるもの", () => {
  assert.equal(toastKind({ id: 1, text: "a" }), "plain");
  assert.equal(toastKind({ id: 1, text: "a", action: { label: "取り消す", run() {} } }), "action");
  assert.equal(toastKind({ id: 1, text: "a", action: { label: "再読み込み", run() {} }, sticky: true }), "sticky");
});
