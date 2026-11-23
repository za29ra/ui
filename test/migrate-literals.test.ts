import assert from "node:assert/strict";
import { test } from "node:test";
import { migrate } from "../scripts/migrate-literals.ts";

const run = (css: string) => migrate(css).css;

test("font-size を段階へ寄せる", () => {
  assert.equal(run(".a {\n  font-size: 0.9rem;\n}"), ".a {\n  font-size: var(--text-md);\n}");
  assert.equal(run(".a {\n  font-size: 15px;\n}"), ".a {\n  font-size: var(--text-md);\n}");
  assert.equal(run(".a {\n  font-size: 1.1rem;\n}"), ".a {\n  font-size: var(--text-lg);\n}");
  assert.equal(run(".a {\n  font-size: 1em;\n}"), ".a {\n  font-size: 1em;\n}");
});

test("入力欄の 16px は --text-input、ほかは --text-base", () => {
  assert.equal(run(".f input {\n  font-size: 16px;\n}"), ".f input {\n  font-size: var(--text-input);\n}");
  assert.equal(run(".f p {\n  font-size: 16px;\n}"), ".f p {\n  font-size: var(--text-base);\n}");
});

test("余白の px を段階へ。負の値は calc、0 はそのまま", () => {
  assert.equal(run(".a {\n  padding: 6px 12px;\n}"), ".a {\n  padding: var(--space-1_5) var(--space-3);\n}");
  assert.equal(run(".a {\n  margin: 0 -4px;\n}"), ".a {\n  margin: 0 calc(-1 * var(--space-1));\n}");
  assert.equal(run(".a {\n  gap: 3px;\n}"), ".a {\n  gap: var(--space-0_5);\n}");
  assert.equal(run(".a {\n  padding-left: max(8px, env(safe-area-inset-left));\n}"), ".a {\n  padding-left: max(var(--space-2), env(safe-area-inset-left));\n}");
});

test("1px と 32px を超える余白は残りに出して触らない（2px 未満はすべて残り）", () => {
  const r = migrate(".a {\n  padding: 1px 48px;\n}");
  assert.equal(r.css, ".a {\n  padding: 1px 48px;\n}");
  assert.deepEqual(r.leftovers.map((l) => l.line), [2]);
});

test("角丸を段階へ", () => {
  assert.equal(run(".a {\n  border-radius: 6px;\n}"), ".a {\n  border-radius: var(--radius-md);\n}");
  assert.equal(run(".a {\n  border-radius: 3px;\n}"), ".a {\n  border-radius: var(--radius-sm);\n}");
  assert.equal(run(".a {\n  border-radius: 10px;\n}"), ".a {\n  border-radius: var(--radius-lg);\n}");
  assert.equal(run(".a {\n  border-radius: 999px;\n}"), ".a {\n  border-radius: var(--radius-full);\n}");
  assert.equal(run(".a {\n  border-radius: 50%;\n}"), ".a {\n  border-radius: 50%;\n}");
});

test("影をぼかしで 3 段へ。inset は触らない", () => {
  assert.equal(run(".a {\n  box-shadow: 0 6px 18px rgb(0 0 0 / 0.25);\n}"), ".a {\n  box-shadow: var(--shadow-lg);\n}");
  assert.equal(run(".a {\n  box-shadow: 0 4px 16px rgb(0 0 0 / 0.18);\n}"), ".a {\n  box-shadow: var(--shadow-md);\n}");
  assert.equal(run(".a {\n  box-shadow: 0 2px 4px rgb(0 0 0 / 0.3);\n}"), ".a {\n  box-shadow: var(--shadow-sm);\n}");
  assert.equal(run(".a {\n  box-shadow: inset 0 -1px 0 var(--border);\n}"), ".a {\n  box-shadow: inset 0 -1px 0 var(--border);\n}");
});

test("動きの時間を 3 段へ。infinite は触らない", () => {
  assert.equal(run(".a {\n  transition: opacity 0.15s ease;\n}"), ".a {\n  transition: opacity var(--duration-fast) ease;\n}");
  assert.equal(run(".a {\n  transition: transform 0.28s;\n}"), ".a {\n  transition: transform var(--duration-slow);\n}");
  assert.equal(run(".a {\n  animation: spin 0.8s linear infinite;\n}"), ".a {\n  animation: spin 0.8s linear infinite;\n}");
});

test("カスタムプロパティの宣言と @keyframes の中は触らない", () => {
  const css = ":root {\n  --gutter: 16px;\n}\n@keyframes x {\n  from {\n    padding: 6px;\n  }\n}";
  assert.equal(run(css), css);
});

test("transition・animation は項目の 1 つ目の時間だけを段階にする", () => {
  assert.equal(run(".a {\n  transition: opacity 0.15s, transform 0.28s;\n}"), ".a {\n  transition: opacity var(--duration-fast), transform var(--duration-slow);\n}");
});

test("delay のある項目と 500ms を超える時間は触らず残りに出す", () => {
  const a = migrate(".a {\n  animation: toast-out 0.3s 5s forwards;\n}");
  assert.equal(a.css, ".a {\n  animation: toast-out 0.3s 5s forwards;\n}");
  assert.deepEqual(a.leftovers.map((l) => l.line), [2]);
  const b = migrate(".a {\n  transition: opacity 1.2s;\n}");
  assert.equal(b.css, ".a {\n  transition: opacity 1.2s;\n}");
  assert.deepEqual(b.leftovers.map((l) => l.line), [2]);
});

test("cubic-bezier の中のカンマで項目を分けない", () => {
  assert.equal(run(".a {\n  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);\n}"), ".a {\n  transition: opacity var(--duration-base) cubic-bezier(0.2, 0, 0, 1);\n}");
});

test("複数行のセレクタを 1 つにまとめて読む", () => {
  assert.equal(run(".a input,\n.b {\n  font-size: 16px;\n}"), ".a input,\n.b {\n  font-size: var(--text-input);\n}");
});

test("16px を超え 100px 未満の角丸は残りに出す。100px 以上は full", () => {
  const r = migrate(".a {\n  border-radius: 22px;\n}");
  assert.equal(r.css, ".a {\n  border-radius: 22px;\n}");
  assert.deepEqual(r.leftovers.map((l) => l.line), [2]);
  assert.equal(run(".a {\n  border-radius: 100px;\n}"), ".a {\n  border-radius: var(--radius-full);\n}");
});

test("ベンダー接頭辞の keyframes の中も触らない", () => {
  const css = "@-webkit-keyframes x {\n  from {\n    padding: 6px;\n  }\n}";
  assert.equal(run(css), css);
});

test("段階の外（11px 未満・22px を超える）の文字の大きさは残りに出して触らない", () => {
  for (const v of ["0.625rem", "9px", "2.5rem", "24px"]) {
    const r = migrate(`.a {\n  font-size: ${v};\n}`);
    assert.equal(r.css, `.a {\n  font-size: ${v};\n}`);
    assert.deepEqual(r.leftovers.map((l) => l.line), [2]);
  }
});

test("!important の付いた宣言は残りに出して触らない", () => {
  for (const d of ["font-size: 14px !important", "padding: 8px !important", "border-radius: 6px !important", "transition: opacity 0.2s !important"]) {
    const r = migrate(`.a {\n  ${d};\n}`);
    assert.equal(r.css, `.a {\n  ${d};\n}`);
    assert.deepEqual(r.leftovers.map((l) => l.line), [2]);
  }
});

test("2px 未満の余白（0.5px など）は残りに出して触らない", () => {
  const r = migrate(".a {\n  padding: 0.5px 8px;\n}");
  assert.equal(r.css, ".a {\n  padding: 0.5px 8px;\n}");
  assert.deepEqual(r.leftovers.map((l) => l.line), [2]);
});

test("0 や 50ms 未満の時間（動きを止める指定）は触らない", () => {
  for (const d of ["transition-duration: 0s", "animation-duration: 0.01ms", "transition: opacity 0s, transform 0.2s"]) {
    const r = migrate(`.a {\n  ${d};\n}`);
    assert.equal(r.css, `.a {\n  ${d};\n}`);
    assert.deepEqual(r.leftovers, []);
  }
});
