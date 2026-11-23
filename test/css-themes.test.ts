import assert from "node:assert/strict";
import { test } from "node:test";
import { readThemes, topLevelRules } from "../src/css-themes.ts";

const css = `
/* コメント { は無視する } */
:root:not([data-theme]),
[data-theme="default-light"] {
  color-scheme: light;
  --bg: #f7f6f2;
  --fg: #1f2328;
}
[data-theme="mocha"] {
  --bg: #1e1e2e;
}
:root {
  --space-1: 4px;
}
[data-theme="default-light"] {
  --accent: #165e83;
}
`;

test("readThemes はテーマごとにトークンをまとめ、あとの宣言で上書きする", () => {
  const themes = readThemes(css);
  assert.deepEqual(themes.get("default-light"), new Map([["--bg", "#f7f6f2"], ["--fg", "#1f2328"], ["--accent", "#165e83"]]));
  assert.deepEqual(themes.get("mocha"), new Map([["--bg", "#1e1e2e"]]));
});

test("readThemes は data-theme の無いセレクタを読まない", () => {
  const themes = readThemes(css);
  assert.equal([...themes.keys()].includes(":root"), false);
  assert.deepEqual([...themes.keys()].sort(), ["default-light", "mocha"]);
});

test("readThemes は複数の CSS を順に重ねる（ui の tokens.css のあとにアプリの CSS）", () => {
  const themes = readThemes(`[data-theme="mocha"] { --bg: #000000; --fg: #ffffff; }`, `[data-theme="mocha"] { --bg: #111111; }`);
  assert.deepEqual(themes.get("mocha"), new Map([["--bg", "#111111"], ["--fg", "#ffffff"]]));
});

test("readThemes は @media などの中を読まない", () => {
  const themes = readThemes(`
[data-theme="mocha"] { --bg: #1e1e2e; }
@media (prefers-color-scheme: dark) {
  :root { --accent: #cba6f7; }
}
@import "x.css";
[data-theme="mocha"] { --fg: #cdd6f4; }`);
  assert.deepEqual(themes.get("mocha"), new Map([["--bg", "#1e1e2e"], ["--fg", "#cdd6f4"]]));
  assert.deepEqual([...themes.keys()], ["mocha"]);
});

test("readThemes は子孫・複合セレクタで例外を投げる（セレクタを含める）", () => {
  assert.throws(() => readThemes(`[data-theme="mocha"] .card { --x: #000000; }`), /\[data-theme="mocha"\] \.card/);
  assert.throws(() => readThemes(`.swatch[data-theme="latte"] { --x: #000000; }`), /\.swatch\[data-theme="latte"\]/);
  assert.throws(() => readThemes(`[data-theme="mocha"], .a[data-theme="latte"] { --x: #000000; }`), /\.a\[data-theme="latte"\]/);
});

test("readThemes は単引用符・引用符なし・:root / html 付きを読む", () => {
  const themes = readThemes(`[data-theme='frappe'] { --bg: #111111; } [data-theme=latte] { --bg: #222222; } html[data-theme="mocha"] { --bg: #333333; }`);
  assert.equal(themes.get("frappe")?.get("--bg"), "#111111");
  assert.equal(themes.get("latte")?.get("--bg"), "#222222");
  assert.equal(themes.get("mocha")?.get("--bg"), "#333333");
});

test("readThemes は値の !important を除く", () => {
  const themes = readThemes(`[data-theme="mocha"] { --bg: #111111 !important; --fg: #222222!important; }`);
  assert.deepEqual(themes.get("mocha"), new Map([["--bg", "#111111"], ["--fg", "#222222"]]));
});

test("readThemes は :root:not([data-theme]) を読まず、例外にもしない", () => {
  const themes = readThemes(`:root:not([data-theme]) { --bg: #fafafa; } :root:not([data-theme]), [data-theme="a"] { --bg: #000000; }`);
  assert.deepEqual([...themes.keys()], ["a"]);
  assert.equal(themes.get("a")?.get("--bg"), "#000000");
});

test("readThemes は [data-theme] 単独を、その時点までに読んだ全テーマに入れる", () => {
  const themes = readThemes(`[data-theme="a"] { --x: #000000; } [data-theme] { --y: #111111; } [data-theme="b"] { --x: #222222; }`);
  assert.equal(themes.get("a")?.get("--y"), "#111111");
  assert.equal(themes.get("b")?.has("--y"), false);
});

test("引用符の中の波括弧を数えない", () => {
  const themes = readThemes(`.a::after { content: "}"; }\n.b::before { content: '{'; }\n[data-theme="mocha"] { --bg: #111111; }`);
  assert.equal(themes.get("mocha")?.get("--bg"), "#111111");
});

test("波括弧が閉じていなければ例外", () => {
  assert.throws(() => readThemes(`[data-theme="mocha"] { --bg: #111111;`), /閉じて/);
});

test("@media・@supports の中に data-theme があれば例外（@keyframes は対象外）", () => {
  assert.throws(() => readThemes(`@media (prefers-color-scheme: dark) { [data-theme="mocha"] { --a: #000000; } }`), /DESIGN\.md 1\.8/);
  assert.throws(() => readThemes(`@supports (color: red) { :root:not([data-theme]) { --a: #000000; } }`), /DESIGN\.md 1\.8/);
  assert.doesNotThrow(() => readThemes(`@media (min-width: 1px) { .a { color: red; } }\n@keyframes x { from { opacity: 0; } to { opacity: 1; } }`));
});

test("topLevelRules は深さ 0 の規則のセレクタと本文を返す", () => {
  const rules = topLevelRules(`/* c { */ .a, .b { color: red; }\n@media (x) { .c { top: 0; } }\n.d { left: 0; }`);
  assert.deepEqual(rules.map((r) => r.selector), [".a, .b", ".d"]);
  assert.match(rules[0].body, /color: red/);
});
