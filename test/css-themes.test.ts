// test/css-themes.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { readThemes } from "../src/css-themes.ts";

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
