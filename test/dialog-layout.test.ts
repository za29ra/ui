import { test } from "node:test";
import assert from "node:assert/strict";
import { SHEET_MAX_PX, usesDialog } from "../src/dialog-layout.ts";

test("画面の短辺と窓の幅が、どちらも境目以上ならダイアログ", () => {
  assert.equal(SHEET_MAX_PX, 600);
  assert.equal(usesDialog(600, 600), true);
  assert.equal(usesDialog(599, 600), false);
  assert.equal(usesDialog(600, 599), false);
});

test("端末と窓ごとの出し方", () => {
  assert.equal(usesDialog(390, 390), false, "iPhone の縦");
  assert.equal(usesDialog(390, 844), false, "iPhone の横（幅は広いがスマホ）");
  assert.equal(usesDialog(744, 744), true, "iPad mini の縦");
  assert.equal(usesDialog(820, 1180), true, "iPad の横");
  assert.equal(usesDialog(820, 375), false, "iPad の Split View の細い窓");
  assert.equal(usesDialog(982, 640), true, "Mac の細めの窓");
});
