import { test } from "node:test";
import assert from "node:assert/strict";
import { afterRelease, nextMenuIndex, opensOnRelease } from "../src/menu-rules.ts";

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
