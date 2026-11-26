import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * 欄とラベル・補足・エラーの組（DESIGN.md 2.1・2.3・3.7）。見た目は components.css の .ui-field。
 * - 縦に積む: ラベル → 欄 → 補足 → エラー。欄は children に関数で渡し、受け取った属性を欄に付ける
 *   <Field label="名前" hint="…" error={err}>{(a) => <input {...a} value={v} onInput={…} />}</Field>
 * - ラベルは <label for> で欄に結ぶ（欄をラベルの中に入れない。欄の横のボタンを押してもラベルのクリックにならない）
 * - error があれば欄に aria-invalid を付け、補足とエラーの文を aria-describedby で読ませる（DESIGN.md 2.3）
 * - チップの並びのように欄でないものは group: ラベルを role="group" の名前にし、補足とエラーは group の aria-describedby で読ませる（a は使わなくてよい）
 * - 検索欄（DESIGN.md 3.7）は .ui-search の中の <input {...SEARCH_INPUT}>
 */
import { useId } from "preact/hooks";
/** 中身があるか（null・undefined・false・"" は無いとみなす） */
const has = (c) => c !== undefined && c !== null && c !== false && c !== "";
export function Field({ label, hint, error, group = false, class: cls = "", children }) {
    const id = useId();
    const hintId = has(hint) ? `${id}-hint` : undefined;
    const errorId = has(error) ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter((x) => x !== undefined).join(" ");
    const attrs = { id };
    if (describedBy !== "")
        attrs["aria-describedby"] = describedBy;
    if (errorId !== undefined)
        attrs["aria-invalid"] = true;
    const className = `ui-field ${cls}`.trim();
    const rest = (_jsxs(_Fragment, { children: [children(attrs), hintId !== undefined && (_jsx("p", { class: "ui-field-hint", id: hintId, children: hint })), errorId !== undefined && (_jsx("p", { class: "ui-field-error", id: errorId, children: error }))] }));
    if (group) {
        return (_jsxs("div", { class: className, role: "group", "aria-labelledby": `${id}-label`, "aria-describedby": attrs["aria-describedby"], children: [_jsx("span", { class: "ui-field-label", id: `${id}-label`, children: label }), rest] }));
    }
    return (_jsxs("div", { class: className, children: [_jsx("label", { class: "ui-field-label", for: id, children: label }), rest] }));
}
/**
 * 検索欄の <input> に広げる属性（DESIGN.md 3.7）。Enter で「検索」、補完・自動修正・大文字化・綴りの下線を止める。
 * autoCorrect だけ大文字を混ぜる: Preact は要素に同じ名前のプロパティがあればプロパティに入れる。Safari の autocorrect は
 * 真偽のプロパティで、"off" を入れると true（自動修正が効く）になる。autoCorrect ならプロパティが無いので属性になり、
 * HTML の属性の名前は小文字に揃うので autocorrect="off" になる
 */
export const SEARCH_INPUT = {
    type: "search",
    enterkeyhint: "search",
    autocomplete: "off",
    autoCorrect: "off",
    autocapitalize: "off",
    spellcheck: false,
};
