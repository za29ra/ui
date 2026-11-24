import { test } from "node:test";
import assert from "node:assert/strict";
import { blocksTouchScroll, closesOnEscape, DISMISS_MIN, inSheetTop, isBackdropClick, isDismissSwipe, isTextField, keyboardInset, revealDelta, SHEET_TOP } from "../src/modal-rules.ts";

test("背景（dialog 自身）で押し始めて、背景で離したときだけ閉じる", () => {
  const dialog = {};
  const field = {};
  assert.equal(isBackdropClick(dialog, dialog, dialog), true);
  assert.equal(isBackdropClick(field, dialog, dialog), false, "文字を選ぶドラッグを外で離した");
  assert.equal(isBackdropClick(dialog, field, dialog), false);
  assert.equal(isBackdropClick(null, dialog, dialog), false, "押し始めが分からない");
  assert.equal(isBackdropClick(dialog, dialog, field), false, "重ねた別の dialog の背景");
  assert.equal(isBackdropClick(null, null, null), false);
});

test("シートの上部から始めた指だけを数える", () => {
  assert.equal(inSheetTop(100, 100), true);
  assert.equal(inSheetTop(100 + SHEET_TOP, 100), true);
  assert.equal(inSheetTop(100 + SHEET_TOP + 1, 100), false);
  assert.equal(inSheetTop(99, 100), false);
});

test("下へ十分に動いたときだけ閉じるスワイプ", () => {
  assert.equal(isDismissSwipe(0, DISMISS_MIN), true);
  assert.equal(isDismissSwipe(0, DISMISS_MIN - 1), false);
  assert.equal(isDismissSwipe(0, -200), false);
  assert.equal(isDismissSwipe(100, 100), false);
  assert.equal(isDismissSwipe(20, 100), true);
});

test("キーボードの高さは、見えている範囲の下端からレイアウトの下端まで", () => {
  assert.equal(keyboardInset(800, 800, 0), 0);
  assert.equal(keyboardInset(800, 460, 0), 340);
  // 入力欄へのスクロールで見えている範囲が下がった分は、隠れていない
  assert.equal(keyboardInset(800, 460, 120), 220);
  assert.equal(keyboardInset(800, 459.6, 0), 340);
});

test("キーボードの高さは負にならず、拡大しているときは 0", () => {
  assert.equal(keyboardInset(800, 820, 0), 0);
  assert.equal(keyboardInset(800, 400, 300), 100);
  assert.equal(keyboardInset(800, 400, 500), 0);
  assert.equal(keyboardInset(800, 400, 0, 2), 0);
});

test("スクロールできる所がないシートでの縦の指の動きは止める", () => {
  assert.equal(blocksTouchScroll(10, null), true);
  assert.equal(blocksTouchScroll(-10, null), true);
  assert.equal(blocksTouchScroll(0, null), false);
});

test("本文がその向きにまだ動けるときだけ通す", () => {
  const top = { scrollTop: 0, scrollHeight: 1000, clientHeight: 400 };
  const middle = { scrollTop: 300, scrollHeight: 1000, clientHeight: 400 };
  const bottom = { scrollTop: 600, scrollHeight: 1000, clientHeight: 400 };
  assert.equal(blocksTouchScroll(10, top), true);
  assert.equal(blocksTouchScroll(-10, top), false);
  assert.equal(blocksTouchScroll(10, middle), false);
  assert.equal(blocksTouchScroll(-10, middle), false);
  assert.equal(blocksTouchScroll(10, bottom), false);
  assert.equal(blocksTouchScroll(-10, bottom), true);
  assert.equal(blocksTouchScroll(-10, { scrollTop: 599.5, scrollHeight: 1000, clientHeight: 400 }), true);
});

test("キーボードで文字を打つ欄だけを、スクロールさせずにフォーカスする", () => {
  assert.equal(isTextField("TEXTAREA", "textarea"), true);
  assert.equal(isTextField("INPUT", "text"), true);
  assert.equal(isTextField("INPUT", "url"), true);
  assert.equal(isTextField("INPUT", "date"), false);
  assert.equal(isTextField("INPUT", "checkbox"), false);
  assert.equal(isTextField("SELECT", "select-one"), false);
  assert.equal(isTextField("BUTTON", "submit"), false);
});

test("欄を本文の見えている範囲に出すスクロールの量", () => {
  assert.equal(revealDelta(100, 200, 50, 500), 0);
  assert.equal(revealDelta(450, 550, 50, 500), 50);
  assert.equal(revealDelta(20, 120, 50, 500), -30);
  // 範囲より高い欄は上端を合わせる
  assert.equal(revealDelta(300, 900, 50, 500), 250);
});

test("Esc は一番上の dialog だけを閉じる要求にする（cancel に任せると、確認ごと編集の画面が閉じる）", () => {
  const parent = {};
  const confirm = {};
  const esc = { key: "Escape", defaultPrevented: false, isComposing: false, keyCode: 27 };
  assert.equal(closesOnEscape(esc, confirm, confirm, confirm), true);
  assert.equal(closesOnEscape(esc, parent, confirm, confirm), false, "上に重なった確認のキー");
  assert.equal(closesOnEscape(esc, confirm, null, confirm), true, "フォーカスが body に落ちていれば、一番上");
  assert.equal(closesOnEscape(esc, parent, null, confirm), false);
  assert.equal(closesOnEscape({ ...esc, defaultPrevented: true }, parent, parent, parent), false, "行を畳むのに使われた");
  assert.equal(closesOnEscape({ ...esc, isComposing: true }, parent, parent, parent), false, "変換中");
  assert.equal(closesOnEscape({ ...esc, keyCode: 229 }, parent, parent, parent), false, "変換中（Safari）");
  assert.equal(closesOnEscape({ ...esc, key: "Enter", keyCode: 13 }, parent, parent, parent), false);
});
