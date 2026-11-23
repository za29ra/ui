// src/css-themes.ts
/**
 * テーマの CSS（[data-theme="…"] のブロックに --トークン: 値 を並べたもの）を、テーマ → トークン → 値 の表に読む。
 * 入れ子・@media の中は読まない（tokens.css とアプリのテーマの上書きは平らに書く決まり。DESIGN.md 1.8）。
 * 同じテーマへの宣言は、引数の順・書いた順に上書きする
 */

export type Themes = Map<string, Map<string, string>>;

const THEME = /\[data-theme="([^"]+)"\]/g;

export function readThemes(...sources: string[]): Themes {
  const themes: Themes = new Map();
  for (const source of sources) {
    const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const names = [...m[1].matchAll(THEME)].map((t) => t[1]);
      if (names.length === 0) continue;
      const decls = [...m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)].map((d) => [d[1], d[2].trim()] as const);
      for (const name of names) {
        const tokens = themes.get(name) ?? new Map<string, string>();
        for (const [k, v] of decls) tokens.set(k, v);
        themes.set(name, tokens);
      }
    }
  }
  return themes;
}
