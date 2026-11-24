/**
 * メニュー（DESIGN.md 2.1）。<dialog popover="auto"> を 1 つ描く。
 * - ボタンから開く: ボタンに {...menuTrigger(menu)} を広げる。外側を押す・Esc で閉じ、開いたボタンにフォーカスが戻る（ブラウザの標準の動き）。
 *   位置は開いたボタン（暗黙のアンカー）を基準に CSS（dialog.ui-menu[popover]）で決める。
 * - 右クリックで開く: 行に onContextMenu={menu.openAt} を付ける。押した位置に置いたアンカー（.ui-menu-anchor）を基準に、右下へ開く
 *   （開いている間は dialog に data-at を付ける。CSS がボタンのときの置き方と替える）。
 * 開くと先頭の項目にフォーカスが入り（dialog の標準）、↓↑・Home・End で動く（menu-rules の moveInMenu）。
 * 項目を選ぶと、メニューを閉じてから onSelect を呼ぶ（確認のダイアログやシートを、メニューを出したまま開かない）
 */
import type { ComponentChildren, RefObject } from "preact";
import { type OpenCount } from "./menu-rules.ts";
export type MenuItem = 
/** checked を渡すとチェックの項目（false でもチェックの分をあける）。icon は ui-ico に足す class（例 "ui-ico-check"・アプリの "ico-defer"） */
{
    kind: "action";
    label: ComponentChildren;
    onSelect(): void;
    danger?: boolean;
    checked?: boolean;
    icon?: string;
    key?: string;
} | {
    kind: "link";
    label: ComponentChildren;
    href: string;
    icon?: string;
    key?: string;
} | {
    kind: "separator";
    key?: string;
};
export interface MenuHandle {
    /** dialog の id（開くボタンの commandfor に使う） */
    id: string;
    menuRef: RefObject<HTMLDialogElement | null>;
    anchorRef: RefObject<HTMLSpanElement | null>;
    /** 右クリック（contextmenu）で、押した位置に開く。preventDefault も行う。押したままなら離してから開く */
    openAt(e: MouseEvent): void;
    /** 内部: openAt が位置を決めたあと、項目を描いてから開くための合図（seq は opens の要求の番号） */
    request: {
        x: number;
        y: number;
        seq: number;
    } | null;
    /** 内部: 右クリックで開く要求の数（閉じた知らせで onClose を呼ぶかを決める） */
    opens: OpenCount;
}
/** Menu に渡す handle を作る */
export declare function useMenu(): MenuHandle;
/** 開くボタンに広げる props */
export declare function menuTrigger(handle: Pick<MenuHandle, "id">): Record<string, string>;
export interface MenuProps {
    menu: MenuHandle;
    /** dialog の aria-label（何のメニューか） */
    label: string;
    items: MenuItem[];
    /** ui-menu の後ろに足す class */
    class?: string;
    /** 閉じたとき（選んだ・外側を押した・Esc のどれでも） */
    onClose?(): void;
}
export declare function Menu({ menu, label, items, class: cls, onClose }: MenuProps): import("preact").JSX.Element;
