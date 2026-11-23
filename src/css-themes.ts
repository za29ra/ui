/**
 * テーマの CSS（[data-theme="…"] のブロックに --トークン: 値 を並べたもの）を、テーマ → トークン → 値 の表に読む。
 * 読むのは波括弧の深さ 0 の規則だけ（@media・@supports などの中は読まない。DESIGN.md 1.8 のとおり、テーマの上書きは平らに書く）。
 * セレクタは `,` で分け、data-theme を含む要素は次のどれかだけ許す。それ以外（子孫・複合など）は例外を投げる。
 *   - [data-theme="名前"]（単引用符・引用符なし・先頭の :root / html もよい）→ そのテーマに入れる
 *   - [data-theme] 単独 → その時点までに読んだ全テーマに入れる（あとから出るテーマには入らない）
 *   - :root:not([data-theme]) → 「テーマなし」なので読まない（例外にもしない）
 * 同じテーマへの宣言は、引数の順・書いた順に上書きする。値の末尾の !important は除く
 */

export type Themes = Map<string, Map<string, string>>;

const NAMED = /^(?::root|html)?\[data-theme=(["']?)([\w-]+)\1\]$/;
const ANY = /^(?::root|html)?\[data-theme\]$/;
const NO_THEME = /^:root:not\(\[data-theme\]\)$/;

/** 深さ 0 の規則（セレクタと、深さ 1 の宣言の本文）を取り出す。@ 規則のブロックは飛ばす */
function topLevelRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let prelude = "";
  let body = "";
  for (const ch of css) {
    if (depth === 0) {
      if (ch === "{") {
        depth = 1;
        body = "";
      } else if (ch === ";") {
        prelude = ""; // @import など、ブロックの無い @ 規則
      } else {
        prelude += ch;
      }
    } else {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      if (depth === 0) {
        const selector = prelude.trim();
        if (!selector.startsWith("@")) rules.push({ selector, body });
        prelude = "";
      } else if (depth === 1) {
        body += ch;
      }
    }
  }
  return rules;
}

export function readThemes(...sources: string[]): Themes {
  const themes: Themes = new Map();
  for (const source of sources) {
    const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const { selector, body } of topLevelRules(css)) {
      const targets: string[] = [];
      let all = false;
      for (const part of selector.split(",")) {
        const el = part.trim();
        if (!el.includes("data-theme") || NO_THEME.test(el)) continue;
        const named = NAMED.exec(el);
        if (named !== null) targets.push(named[2]);
        else if (ANY.test(el)) all = true;
        else throw new Error(`読めないテーマのセレクタ: ${el}（テーマの宣言は [data-theme="名前"] と平らに書く）`);
      }
      if (targets.length === 0 && !all) continue;
      const decls = [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)].map(
        (d) => [d[1], d[2].replace(/\s*!important\s*$/i, "").trim()] as const,
      );
      const names = new Set(targets);
      if (all) for (const name of themes.keys()) names.add(name);
      for (const name of names) {
        const tokens = themes.get(name) ?? new Map<string, string>();
        for (const [k, v] of decls) tokens.set(k, v);
        themes.set(name, tokens);
      }
    }
  }
  return themes;
}
