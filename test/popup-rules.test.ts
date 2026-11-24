import { test } from "node:test";
import assert from "node:assert/strict";
import { pickStep, placePopup, popupMaxHeight, pressKind, visibleView } from "../src/popup-rules.ts";

const view = { left: 0, top: 0, width: 375, height: 700 };
const anchor = (left: number, top: number, width = 150, height = 40) => ({ left, top, right: left + width, bottom: top + height });
const size = { width: 300, height: 320 };

test("位置: 欄の 4px 下に、左を揃える", () => {
  assert.deepEqual(placePopup(anchor(20, 100), size, view), { left: 20, top: 144 });
});

test("位置: 右に入らなければ右を揃える。それでもはみ出すなら画面に収める", () => {
  assert.deepEqual(placePopup(anchor(200, 100, 160), size, view), { left: 60, top: 144 });
  assert.equal(placePopup(anchor(120, 100, 80), size, view).left, 8);
  assert.equal(placePopup(anchor(-30, 100), size, view).left, 8);
});

test("位置: 下に入らなければ上。どちらにも入らなければ見えている範囲に収める", () => {
  assert.equal(placePopup(anchor(20, 500), size, view).top, 500 - 4 - 320);
  assert.equal(placePopup(anchor(20, 250), { width: 300, height: 420 }, view).top, 700 - 8 - 420);
  assert.equal(placePopup(anchor(20, 250), { width: 300, height: 900 }, view).top, 8, "高すぎるときは上端");
});

test("位置: キーボードで狭く、下へずれた範囲に収める", () => {
  const visible = { left: 0, top: 120, width: 375, height: 380 };
  const { top } = placePopup(anchor(20, 300), size, visible);
  assert.ok(top >= 128 && top + size.height <= 492, String(top));
});

test("位置: 欄が見えている範囲の外へ流れても、画面から出ない", () => {
  assert.equal(placePopup(anchor(20, -300), size, view).top, 8);
  assert.equal(placePopup(anchor(20, 900), size, view).top, 700 - 8 - 320);
});

test("押した所: popup の中と自分の欄は内側、ほかの欄は切り替え、あとは外側（閉じるだけ）", () => {
  const at = { inPopup: false, inAnchor: false, inTrigger: false };
  assert.equal(pressKind({ ...at, inPopup: true }), "inside");
  assert.equal(pressKind({ ...at, inAnchor: true, inTrigger: true }), "inside");
  assert.equal(pressKind({ ...at, inTrigger: true }), "switch");
  assert.equal(pressKind(at), "outside");
});

test("高さの上限: ふつうは見えている範囲。一覧（beside）は欄の上下の広いほうに収め、欄に重ねない", () => {
  assert.equal(popupMaxHeight(anchor(20, 100), view, false), 700 - 16);
  assert.equal(popupMaxHeight(anchor(20, 100), view, true), 700 - 8 - 144);
  assert.equal(popupMaxHeight(anchor(20, 500), view, true), 500 - 4 - 8);
  const a = anchor(20, 300.4);
  const height = popupMaxHeight(a, view, true);
  const { top } = placePopup(a, { width: 240, height }, view);
  assert.ok(top >= a.bottom || top + height <= a.top, `${top} ${height}`);
});

test("高さの上限: 上下とも狭すぎれば、重なってもよいので読める高さ", () => {
  assert.equal(popupMaxHeight(anchor(20, 100), { ...view, height: 240 }, true), 160);
  assert.equal(popupMaxHeight(anchor(20, 50), { ...view, height: 120 }, true), 104);
});

test("一覧の矢印: 上下に移り、端で止まる。Home・End は端。ほかのキーは null", () => {
  assert.equal(pickStep(2, 5, "ArrowDown"), 3);
  assert.equal(pickStep(4, 5, "ArrowDown"), 4);
  assert.equal(pickStep(0, 5, "ArrowUp"), 0);
  assert.equal(pickStep(2, 5, "Home"), 0);
  assert.equal(pickStep(2, 5, "End"), 4);
  assert.equal(pickStep(2, 5, "Enter"), null);
});

test("置ける範囲: 見えている範囲から、安全領域（ステータスバー・ホームバー）を除く", () => {
  const safe = { top: 59, bottom: 34 };
  assert.deepEqual(visibleView({ left: 0, top: 0, width: 393, height: 852 }, 852, safe), { left: 0, top: 59, width: 393, height: 852 - 59 - 34 });
  assert.deepEqual(visibleView({ left: 0, top: 0, width: 393, height: 500 }, 852, safe), { left: 0, top: 59, width: 393, height: 441 }, "キーボードが出ていれば下は除かない");
  assert.deepEqual(visibleView({ left: 0, top: 120, width: 393, height: 500 }, 852, safe), { left: 0, top: 120, width: 393, height: 500 }, "ずれて隠れている分は二重に除かない");
});
