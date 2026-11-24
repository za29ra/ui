import { test } from "node:test";
import assert from "node:assert/strict";
import { appKey } from "../src/storage.ts";

test("端末に覚えるキーは <アプリ名>.<キー>", () => {
  assert.equal(appKey("demo", "theme"), "demo.theme");
});

test("アプリ名は英小文字・数字・- だけ。ほかは投げる（キーが混ざらず、インラインのスクリプトに埋めても安全なように）", () => {
  assert.equal(appKey("my-app", "theme"), "my-app.theme");
  assert.throws(() => appKey("", "theme"));
  assert.throws(() => appKey("a.b", "theme"));
  assert.throws(() => appKey("Demo", "theme"));
  assert.throws(() => appKey("</script>", "theme"));
  assert.throws(() => appKey("my app", "theme"));
});
