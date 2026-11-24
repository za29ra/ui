/**
 * 欄に接する popup。中身は知らない（位置・外側・キーだけ）。決まりは popup-rules.ts。一度に 1 つ。
 * - popover="manual" で、起点と同じ dialog の中に描く（トップレイヤーに出るので overflow に切られず、inert にもならない）。
 *   auto は使わない: 外側の押下が下の要素に届く
 * - 外側を押したら閉じるだけ。click まで止める（Modal の背景・保存・✕ も動かさない）。
 *   タッチは touchend で止める（Modal は touchend で欄に自分でフォーカスする。click を止めてもキーボードが出る）
 * - キーは window の capture で先に受ける（アプリのキーの処理と Modal より前）
 * - どう閉じても入った値は残る。値を入れるのは中身と onClose
 */
import type { ComponentChildren } from "preact";
/** popup を開く欄に付ける（押すと、開いている popup から切り替わる） */
export declare const POPUP_TRIGGER: {
    "data-popup-trigger": string;
};
/** within の中に popup が開いているか */
export declare function hasPopup(within: Element): boolean;
/** within の中の popup を閉じる。閉じたら true（Modal の cancel は、それで終える） */
export declare function closePopup(within: Element): boolean;
export interface PopupProps {
    /** 起点の欄。描き直しで入れ替わることがあるので、毎回引く。無くなったら閉じる */
    anchor(): HTMLElement | null | undefined;
    onClose(): void;
    /** role="dialog" の名前。候補の一覧（中に listbox）では渡さない */
    label?: string;
    class?: string;
    /** 長い一覧: 欄の上下に収めて中をスクロールさせる（起点に重ねない） */
    beside?: boolean;
    children: ComponentChildren;
}
export declare function Popup({ anchor, onClose, label, class: cls, beside, children }: PopupProps): import("preact").JSX.Element;
