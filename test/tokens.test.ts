// test/tokens.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { contrast } from "../src/contrast.ts";
import { readThemes } from "../src/css-themes.ts";

const css = readFileSync(new URL("../css/tokens.css", import.meta.url), "utf8");
const themes = readThemes(css);

const THEMES = ["default-light", "default-dark", "latte", "frappe", "macchiato", "mocha"];
const COLOR_TOKENS = [
  "--bg", "--bg-raised", "--bg-sunken", "--bg-hover", "--bg-selected",
  "--fg", "--fg-muted", "--fg-faint", "--border",
  "--accent", "--accent-fg", "--danger", "--danger-fg", "--success",
  "--toast-bg", "--toast-fg",
];

test("6 テーマのすべてが色のトークンをそろえる", () => {
  for (const theme of THEMES) {
    const tokens = themes.get(theme);
    assert.ok(tokens, `${theme} がない`);
    for (const name of COLOR_TOKENS) assert.ok(tokens.has(name), `${theme} に ${name} がない`);
  }
});

/** DESIGN.md 1.9 の表（標準テーマで満たす） */
const PAIRS: Array<[fg: string, bg: string, min: number]> = [
  ...["--bg", "--bg-raised", "--bg-sunken", "--bg-hover", "--bg-selected"].map((bg) => ["--fg", bg, 4.5] as [string, string, number]),
  ...["--bg", "--bg-raised", "--bg-sunken", "--bg-hover"].map((bg) => ["--fg-muted", bg, 4.5] as [string, string, number]),
  ["--accent-fg", "--accent", 4.5],
  ["--danger", "--bg", 4.5],
  ["--danger", "--bg-raised", 4.5],
  ["--danger-fg", "--danger", 4.5],
  ["--accent", "--bg", 3],
  ["--success", "--bg", 3],
  ["--toast-fg", "--toast-bg", 4.5],
];

for (const theme of ["default-light", "default-dark"]) {
  test(`${theme} は DESIGN.md 1.9 のコントラストを満たす`, () => {
    const t = themes.get(theme)!;
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(t.get(fg)!, t.get(bg)!);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} = ${ratio.toFixed(2)}（${min} 未満）`);
    }
  });
}

test("default-light は data-theme の無い文書の既定も兼ねる", () => {
  assert.match(css, /:root:not\(\[data-theme\]\),\s*\[data-theme="default-light"\]\s*\{/);
});
