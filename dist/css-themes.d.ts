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
/**
 * 深さ 0 の規則（セレクタと、深さ 1 の宣言の本文）を取り出す。引用符の中の波括弧は数えない。
 * @ 規則のブロックは飛ばすが、@keyframes 以外で中に data-theme があれば例外（テーマの上書きは @media に入れない。DESIGN.md 1.8）。
 * 読み終えて波括弧が閉じていなければ例外
 */
export declare function topLevelRules(source: string): Array<{
    selector: string;
    body: string;
}>;
export declare function readThemes(...sources: string[]): Themes;
