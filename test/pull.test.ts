import { test } from "node:test";
import assert from "node:assert/strict";
import {
  arrowAngle,
  isScrollContainer,
  PULL_MAX,
  PULL_TRIGGER,
  pullAxis,
  pullDistance,
  pullProgress,
  pullReady,
  REFRESH_MAX_MS,
  REFRESH_MIN_MS,
  refreshDone,
} from "../src/pull.ts";

test("引いた距離は指の動きの半分で、上限があり、上に動かしたら 0", () => {
  assert.equal(pullDistance(100, 140), 20);
  assert.equal(pullDistance(100, 1000), PULL_MAX);
  assert.equal(pullDistance(100, 50), 0);
});

test("トリガーの距離で離すと読み直し、進みと矢印はそこで 1・180 度", () => {
  assert.equal(pullReady(PULL_TRIGGER - 1), false);
  assert.equal(pullReady(PULL_TRIGGER), true);
  assert.equal(pullProgress(PULL_TRIGGER / 2), 0.5);
  assert.equal(pullProgress(PULL_MAX), 1);
  assert.equal(arrowAngle(PULL_TRIGGER), 180);
  assert.equal(arrowAngle(0), 0);
});

test("更新中の表示は、最低限の時間は残り、読み込みが終わらなくても上限で閉じる", () => {
  assert.equal(refreshDone(REFRESH_MIN_MS - 1, 0, false), false);
  assert.equal(refreshDone(REFRESH_MIN_MS, 0, false), true);
  assert.equal(refreshDone(REFRESH_MIN_MS, 0, true), false);
  assert.equal(refreshDone(REFRESH_MAX_MS, 0, true), true);
});

test("縦横の判定: 小さい動きは決めない・縦が大きければ縦", () => {
  assert.equal(pullAxis(2, 3), null);
  assert.equal(pullAxis(1, 20), true);
  assert.equal(pullAxis(20, 5), false);
});

test("スクロールできる領域: overflow が auto/scroll で中身がはみ出しているときだけ", () => {
  const box = { overflowX: "visible", overflowY: "auto", scrollWidth: 100, clientWidth: 100, scrollHeight: 300, clientHeight: 100 };
  assert.equal(isScrollContainer(box), true);
  assert.equal(isScrollContainer({ ...box, scrollHeight: 100 }), false);
  assert.equal(isScrollContainer({ ...box, overflowY: "visible" }), false);
  assert.equal(isScrollContainer({ ...box, overflowY: "visible", overflowX: "scroll", scrollWidth: 200 }), true);
});
