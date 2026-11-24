import { test } from "node:test";
import assert from "node:assert/strict";
import { afterRelease, createOpenCount, nextMenuIndex, opensOnRelease } from "../src/menu-rules.ts";

test("↓↑ は 1 つずつ動き、端では反対の端へ回る", () => {
  assert.equal(nextMenuIndex("ArrowDown", 0, 3), 1);
  assert.equal(nextMenuIndex("ArrowDown", 2, 3), 0);
  assert.equal(nextMenuIndex("ArrowUp", 1, 3), 0);
  assert.equal(nextMenuIndex("ArrowUp", 0, 3), 2);
});

test("Home・End は先頭・末尾", () => {
  assert.equal(nextMenuIndex("Home", 2, 3), 0);
  assert.equal(nextMenuIndex("End", 0, 3), 2);
});

test("フォーカスが項目にないときは、↓ で先頭、↑ で末尾", () => {
  assert.equal(nextMenuIndex("ArrowDown", -1, 3), 0);
  assert.equal(nextMenuIndex("ArrowUp", -1, 3), 2);
});

test("ほかのキーと、項目がないときは動かさない", () => {
  assert.equal(nextMenuIndex("Enter", 0, 3), null);
  assert.equal(nextMenuIndex("Tab", 0, 3), null);
  assert.equal(nextMenuIndex("ArrowDown", -1, 0), null);
});

test("右クリックでボタンを押したまま（Mac の contextmenu は押したときに来る）なら、離してから開く", () => {
  // 押している間に開くと、離したときの pointerup の light dismiss で閉じる
  assert.equal(opensOnRelease(2), true);
  assert.equal(opensOnRelease(1), true);
  // 離したあとに来る contextmenu（Windows）やキーボードのメニューキーは、すぐ開く
  assert.equal(opensOnRelease(0), false);
});

test("離したら（pointerup）一度だけ開き、見張りを外す", () => {
  const win = new EventTarget();
  const deferred: Array<() => void> = [];
  let opened = 0;
  afterRelease(win, () => opened++, (f) => deferred.push(f));
  win.dispatchEvent(new Event("pointerup"));
  // light dismiss が終わってから開くので、その場では開かない
  assert.equal(opened, 0);
  assert.equal(deferred.length, 1);
  deferred[0]();
  assert.equal(opened, 1);
  // 2 回目の pointerup はもう見ていない
  win.dispatchEvent(new Event("pointerup"));
  assert.equal(deferred.length, 1);
});

test("離す前に pointercancel・ウィンドウの blur・次の pointerdown が来たら開かず、見張りを外す（あとの左クリックで古いメニューを開かない）", () => {
  for (const type of ["pointercancel", "blur", "pointerdown"]) {
    const win = new EventTarget();
    let opened = 0;
    afterRelease(win, () => opened++, (f) => f());
    win.dispatchEvent(new Event(type));
    win.dispatchEvent(new Event("pointerup"));
    assert.equal(opened, 0, type);
  }
});

test("離す前に取りやめたら onCancel を一度だけ呼ぶ（離して開いたときは呼ばない）", () => {
  const win = new EventTarget();
  let opened = 0;
  let cancelled = 0;
  afterRelease(win, () => opened++, (f) => f(), () => cancelled++);
  win.dispatchEvent(new Event("blur"));
  win.dispatchEvent(new Event("pointerdown"));
  assert.equal(cancelled, 1);
  assert.equal(opened, 0);

  const win2 = new EventTarget();
  afterRelease(win2, () => opened++, (f) => f(), () => cancelled++);
  win2.dispatchEvent(new Event("pointerup"));
  win2.dispatchEvent(new Event("pointercancel"));
  assert.equal(opened, 1);
  assert.equal(cancelled, 1);
});

test("A のメニューを出したまま B を右クリック: A が閉じた知らせ（あとから来る）では閉じたことにしない", () => {
  const c = createOpenCount();
  // A を右クリックして開く
  const a = c.request();
  c.settle(a);
  assert.equal(c.settled(), true);
  // B を右クリック（押したまま）。押したときの light dismiss で A が閉じ、その toggle はあとから来る
  const b = c.request();
  assert.equal(c.settled(), false, "A の toggle（closed）では onClose を呼ばない");
  // 離して B を開く
  c.settle(b);
  assert.equal(c.settled(), true, "B を閉じたときは onClose を呼ぶ");
});

test("開くのを取りやめた要求も済んだことにする（次に閉じたときに onClose を呼ぶ）", () => {
  const c = createOpenCount();
  const a = c.request();
  c.settle(a);
  const b = c.request();
  c.settle(b); // 離す前に取りやめた
  assert.equal(c.settled(), true);
});

test("古い要求を済ませても、新しい要求は済んだことにならない", () => {
  const c = createOpenCount();
  const a = c.request();
  const b = c.request();
  c.settle(b);
  c.settle(a);
  assert.equal(c.settled(), true);
  const d = c.request();
  c.settle(a);
  assert.equal(c.settled(), false);
  c.settle(d);
  assert.equal(c.settled(), true);
});
