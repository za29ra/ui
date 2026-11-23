import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../css/components.css", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
/** コメントを除いた本文 */
const body = css.replace(/\/\*[\s\S]*?\*\//g, "");

/** 規則のセレクタ（@ 規則と @keyframes の中の from・to・% を除く）。, で分けたもの */
function selectors(): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/([^{};]+)\{/g)) {
    const prelude = m[1].trim();
    if (prelude.startsWith("@") || /^(from|to|\d+%)$/.test(prelude)) continue;
    out.push(...prelude.split(/,(?![^()]*\))/).map((s) => s.trim()));
  }
  return out;
}

/** 宣言（プロパティ → 値）と、その行の全体（ui-allow を見る） */
function declarations(): Array<{ prop: string; value: string; line: string }> {
  return css.split("\n").flatMap((line) => {
    const m = /^\s*([a-z-]+)\s*:\s*([^;]+);/.exec(line);
    return m ? [{ prop: m[1], value: m[2].trim(), line }] : [];
  });
}

test("規則のセレクタは :where() で包む（詳細度 0。アプリの指定が必ず勝つ）", () => {
  const all = selectors();
  assert.ok(all.length > 0);
  for (const s of all) assert.match(s, /^:where\(.*\)(::[\w-]+)?$/s, s);
});

test("class の名前は ui- で始める", () => {
  for (const s of selectors()) {
    for (const [, name] of s.matchAll(/\.([a-zA-Z_][\w-]*)/g)) assert.ok(name.startsWith("ui-") || name === "dialogs", `${s} の .${name}`);
  }
});

test("@keyframes の名前は ui- で始める", () => {
  const names = [...body.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.ok(names.length > 0);
  for (const n of names) assert.ok(n.startsWith("ui-"), n);
});

test("色はトークンで書く（カスタムプロパティの定義を除く）", () => {
  for (const { prop, value, line } of declarations()) {
    if (prop.startsWith("--")) continue;
    assert.doesNotMatch(value, /#[0-9a-f]{3,8}\b|\b(rgb|hsl|oklch)a?\(|\b(white|black)\b/i, line);
  }
});

test("font-size は段階のトークン（部品の中の大きさは ui-allow に理由を書く）", () => {
  for (const { prop, value, line } of declarations()) {
    if (prop !== "font-size") continue;
    assert.ok(/^var\(--text-[\w-]+\)$/.test(value) || /ui-allow: \S/.test(line), line);
  }
});

test("border-radius はトークン・0・50%・同心の calc()", () => {
  const one = /^(var\(--radius-[\w-]+\)|0|50%|calc\(var\(--radius-[\w-]+\) - (var\(--space-[\w-]+\)|1px)\))$/;
  for (const { prop, value, line } of declarations()) {
    if (prop !== "border-radius") continue;
    for (const part of value.split(/\s+(?![^()]*\))/)) assert.match(part, one, line);
  }
});

test("package.json が components.css を出す", () => {
  assert.equal(pkg.exports["./components.css"], "./css/components.css");
});
