import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { topLevelRules } from "../src/css-themes.ts";

const css = readFileSync(new URL("../css/base.css", import.meta.url), "utf8");

test("フォーカスの輪の規則は、セレクタ全体を :where() で包む（詳細度 0。アプリの指定が勝つ）", () => {
  const rules = topLevelRules(css).filter((r) => r.selector.includes(":focus-visible"));
  assert.ok(rules.length > 0);
  for (const { selector } of rules) {
    assert.match(selector.trim(), /^:where\(.*\)$/s, selector);
  }
});
