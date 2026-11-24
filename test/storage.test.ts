import { test } from "node:test";
import assert from "node:assert/strict";
import { appKey } from "../src/storage.ts";

test("端末に覚えるキーは <アプリ名>.<キー>", () => {
  assert.equal(appKey("demo", "theme"), "demo.theme");
});

test("アプリ名が空・ドットを含むなら投げる（キーが混ざらないように）", () => {
  assert.throws(() => appKey("", "theme"));
  assert.throws(() => appKey("a.b", "theme"));
});
