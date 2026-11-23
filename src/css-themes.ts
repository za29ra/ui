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

/**
 * 深さ 0 の規則（セレクタと、深さ 1 の宣言の本文）を取り出す。引用符の中の波括弧は数えない。
 * @ 規則のブロックは飛ばすが、@keyframes 以外で中に data-theme があれば例外（テーマの上書きは @media に入れない。DESIGN.md 1.8）。
 * 読み終えて波括弧が閉じていなければ例外
 */
export function topLevelRules(source: string): Array<{ selector: string; body: string }> {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let prelude = "";
  let body = "";
  let inner = "";
  let quote = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote !== "") {
      if (depth === 0) prelude += ch;
      else inner += ch;
      if (ch === "\\" && i + 1 < css.length) {
        i++;
        if (depth === 0) prelude += css[i];
        else {
          inner += css[i];
          if (depth === 1) body += ch + css[i];
        }
        continue;
      }
      if (depth === 1) body += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      if (depth === 0) prelude += ch;
      else {
        inner += ch;
        if (depth === 1) body += ch;
      }
      continue;
    }
    if (depth === 0) {
      if (ch === "{") {
        depth = 1;
        body = "";
        inner = "";
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
        if (selector.startsWith("@")) {
          if (!/^@(-\w+-)?keyframes\b/.test(selector) && inner.includes("data-theme")) {
            throw new Error(`@ 規則の中にテーマのセレクタがあります: ${selector}（テーマの上書きは @media に入れない。DESIGN.md 1.8）`);
          }
        } else {
          rules.push({ selector, body });
        }
        prelude = "";
      } else {
        inner += ch;
        if (depth === 1) body += ch;
      }
    }
  }
  if (depth !== 0 || quote !== "") throw new Error("波括弧か引用符が閉じていません");
  return rules;
}

export function readThemes(...sources: string[]): Themes {
  const themes: Themes = new Map();
  for (const source of sources) {
    for (const { selector, body } of topLevelRules(source)) {
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
