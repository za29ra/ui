// test/contrast.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrast, luminance, parseColor } from "../src/contrast.ts";

test("parseColor は #rgb と #rrggbb を読む", () => {
  assert.deepEqual(parseColor("#fff"), [255, 255, 255]);
  assert.deepEqual(parseColor("#1f2328"), [31, 35, 40]);
});

test("parseColor は読めない値で null を返す", () => {
  assert.equal(parseColor("var(--bg)"), null);
  assert.equal(parseColor("#12"), null);
});

test("luminance は白で 1、黒で 0", () => {
  assert.equal(luminance("#ffffff"), 1);
  assert.equal(luminance("#000000"), 0);
});

test("contrast は白と黒で 21、同じ色で 1、向きによらない", () => {
  assert.equal(contrast("#ffffff", "#000000"), 21);
  assert.equal(contrast("#777777", "#777777"), 1);
  assert.equal(contrast("#5f6672", "#f7f6f2"), contrast("#f7f6f2", "#5f6672"));
});

test("contrast は WCAG の式どおり（#6b7280 on #f7f6f2 は 4.47）", () => {
  assert.equal(Math.round(contrast("#6b7280", "#f7f6f2") * 100) / 100, 4.47);
});
