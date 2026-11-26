import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../css/components.css", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
/** コメントを除いた本文 */
const body = css.replace(/\/\*[\s\S]*?\*\//g, "");

/** 括弧の深さが 0 のところにある sep だけで分ける */
function splitTopLevel(value: string, sep: RegExp): string[] {
  const out: string[] = [];
  const re = new RegExp(sep.source, sep.flags.replace("g", ""));
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0) {
      const m = re.exec(value.slice(i));
      if (m && m.index === 0 && m[0].length > 0) {
        out.push(value.slice(start, i));
        i += m[0].length - 1;
        start = i + 1;
      }
    }
  }
  out.push(value.slice(start));
  return out;
}

/** セレクタが :where(...) 1 つ（と末尾の ::擬似要素）だけでできている（詳細度 0） */
function isZeroSpecificity(selector: string): boolean {
  if (!selector.startsWith(":where(")) return false;
  let depth = 0;
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] === "(") depth++;
    else if (selector[i] === ")" && --depth === 0) return /^(::[\w-]+)?$/.test(selector.slice(i + 1));
  }
  return false;
}

/** 規則のセレクタ（@ 規則と @keyframes の中の from・to・% を除く）。, で分けたもの */
function selectors(): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/([^{};]+)\{/g)) {
    const prelude = m[1].trim();
    if (prelude.startsWith("@") || /^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(prelude)) continue;
    out.push(...splitTopLevel(prelude, /,/).map((s) => s.trim()));
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
  for (const s of all) assert.ok(isZeroSpecificity(s), s);
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
    for (const part of splitTopLevel(value, /\s+/)) assert.match(part, one, line);
  }
});

test("package.json が components.css を出す", () => {
  assert.equal(pkg.exports["./components.css"], "./css/components.css");
});

test("splitTopLevel は括弧の中では分けない", () => {
  assert.deepEqual(splitTopLevel("calc(var(--radius-lg) - var(--space-0_5)) 0", /\s/), ["calc(var(--radius-lg) - var(--space-0_5))", "0"]);
  assert.deepEqual(splitTopLevel(":where(a, b), :where(c)", /,/).map((x) => x.trim()), [":where(a, b)", ":where(c)"]);
});

test("isZeroSpecificity は :where の外に何かあるセレクタを通さない", () => {
  assert.equal(isZeroSpecificity(":where(a) .b"), false);
  assert.equal(isZeroSpecificity(":where(a) .b:not(.c)"), false);
  assert.equal(isZeroSpecificity(":where(dialog.ui-sheet)::backdrop"), true);
  assert.equal(isZeroSpecificity(":where(a, b)"), true);
});

/** ui の規則（:where(sel) {…}）の宣言の本文 */
function ruleBody(sel: string): string {
  const start = body.indexOf(`:where(${sel}) {`);
  assert.ok(start >= 0, `${sel} の規則がある`);
  return body.slice(start, body.indexOf("}", start));
}

test("Popup は ui の規則だけで画面に固定され、安全領域と高さの上限を使える（popup.tsx が left・top・--popup-max を入れ、--safe-top・--safe-bottom を読む）", () => {
  const r = ruleBody(".ui-popup");
  assert.match(r, /--safe-top:\s*env\(safe-area-inset-top/);
  assert.match(r, /--safe-bottom:\s*env\(safe-area-inset-bottom/);
  assert.match(r, /position:\s*fixed/);
  assert.match(r, /inset:\s*auto/);
  assert.match(r, /max-height:\s*var\(--popup-max/);
});

test("アイコンの土台は 20px・currentColor・--glyph の mask（DESIGN.md 2.5）", () => {
  const r = ruleBody(".ui-ico");
  assert.match(r, /width:\s*20px/);
  assert.match(r, /height:\s*20px/);
  assert.match(r, /background-color:\s*currentColor/);
  assert.match(r, /mask:\s*var\(--glyph\)/);
});

test("ui の部品が使うアイコンを持つ", () => {
  for (const name of ["close", "check", "bell", "bell-off", "alert", "more"]) {
    assert.match(ruleBody(`.ui-ico-${name}`), /--glyph:\s*url\("data:image\/svg\+xml,/, name);
  }
});

test("popover のメニューはアンカーの下に置き、収まらなければ反転し、高さを画面の半分までにする", () => {
  const r = ruleBody("dialog.ui-menu[popover]");
  assert.match(r, /position:\s*fixed/);
  assert.match(r, /inset:\s*auto/);
  assert.match(r, /position-area:/);
  assert.match(r, /position-try-fallbacks:/);
  assert.match(r, /width:\s*var\(--menu-width,\s*220px\)/);
  assert.match(r, /max-height:/);
});

test("popover で開いたメニューは表示される（dialog:not([open]) の display: none を上書きする）", () => {
  assert.match(ruleBody("dialog.ui-menu:popover-open"), /display:\s*block/);
});

test("右クリックで開いたメニュー（data-at）は押した位置の右下に開き、ボタンのときの規則より後ろにある", () => {
  assert.match(ruleBody("dialog.ui-menu[popover][data-at]"), /position-area:\s*block-end span-inline-end/);
  assert.ok(body.indexOf(":where(dialog.ui-menu[popover][data-at])") > body.indexOf(":where(dialog.ui-menu[popover]) {"));
});

test("Field はラベル → 欄 → 補足 → エラーを縦に積む（DESIGN.md 2.1）", () => {
  assert.match(ruleBody(".ui-field"), /flex-direction:\s*column/);
  const label = ruleBody(".ui-field-label");
  assert.match(label, /font-size:\s*var\(--text-xs\)/);
  assert.match(label, /color:\s*var\(--fg-muted\)/);
  assert.match(label, /font-weight:\s*600/);
  assert.match(ruleBody(".ui-field-hint"), /color:\s*var\(--fg-muted\)/);
  assert.match(ruleBody(".ui-field-error"), /color:\s*var\(--danger\)/);
});
