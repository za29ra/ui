import type { ComponentChildren } from "preact";
/** 欄に付ける属性 */
export interface FieldAttrs {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
}
export interface FieldProps {
    label: ComponentChildren;
    /** 欄の下の補足 */
    hint?: ComponentChildren;
    /** エラーの文。あれば欄に aria-invalid を付け、補足の下に出す */
    error?: ComponentChildren;
    /** 欄でなく選ぶものの並び。<label> でなく role="group" */
    group?: boolean;
    /** ui-field の後ろに足す class */
    class?: string;
    children(attrs: FieldAttrs): ComponentChildren;
}
export declare function Field({ label, hint, error, group, class: cls, children }: FieldProps): import("preact").JSX.Element;
/**
 * 検索欄の <input> に広げる属性（DESIGN.md 3.7）。Enter で「検索」、補完・自動修正・大文字化・綴りの下線を止める。
 * autoCorrect だけ大文字を混ぜる: Preact は要素に同じ名前のプロパティがあればプロパティに入れる。Safari の autocorrect は
 * 真偽のプロパティで、"off" を入れると true（自動修正が効く）になる。autoCorrect ならプロパティが無いので属性になり、
 * HTML の属性の名前は小文字に揃うので autocorrect="off" になる
 */
export declare const SEARCH_INPUT: {
    readonly type: "search";
    readonly enterkeyhint: "search";
    readonly autocomplete: "off";
    readonly autoCorrect: "off";
    readonly autocapitalize: "off";
    readonly spellcheck: false;
};
