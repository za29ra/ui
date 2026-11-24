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
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { afterRelease, createOpenCount, moveInMenu, opensOnRelease, type OpenCount } from "./menu-rules.ts";

export type MenuItem =
  /** checked を渡すとチェックの項目（false でもチェックの分をあける）。icon は ui-ico に足す class（例 "ui-ico-check"・アプリの "ico-defer"） */
  | { kind: "action"; label: ComponentChildren; onSelect(): void; danger?: boolean; checked?: boolean; icon?: string; key?: string }
  | { kind: "link"; label: ComponentChildren; href: string; icon?: string; key?: string }
  | { kind: "separator"; key?: string };

export interface MenuHandle {
  /** dialog の id（開くボタンの commandfor に使う） */
  id: string;
  menuRef: RefObject<HTMLDialogElement | null>;
  anchorRef: RefObject<HTMLSpanElement | null>;
  /** 右クリック（contextmenu）で、押した位置に開く。preventDefault も行う。押したままなら離してから開く */
  openAt(e: MouseEvent): void;
  /** 内部: openAt が位置を決めたあと、項目を描いてから開くための合図（seq は opens の要求の番号） */
  request: { x: number; y: number; seq: number } | null;
  /** 内部: 右クリックで開く要求の数（閉じた知らせで onClose を呼ぶかを決める） */
  opens: OpenCount;
}

/** Menu に渡す handle を作る */
export function useMenu(): MenuHandle {
  const id = `ui-menu-${useId()}`;
  const menuRef = useRef<HTMLDialogElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [request, setRequest] = useState<MenuHandle["request"]>(null);
  const [opens] = useState(createOpenCount);
  const openAt = (e: MouseEvent) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    // 待つかどうかを決める前に数える（離すのを待つ間に、前のメニューの閉じた知らせが来る）
    const seq = opens.request();
    const go = () => setRequest({ x, y, seq });
    // buttons の無い作り物のイベント（見本など）は、押していないものとして扱う
    if (opensOnRelease(e.buttons ?? 0)) afterRelease(window, go, undefined, () => opens.settle(seq));
    else go();
  };
  return { id, menuRef, anchorRef, openAt, request, opens };
}

/** 開くボタンに広げる props */
export function menuTrigger(handle: Pick<MenuHandle, "id">): Record<string, string> {
  return { commandfor: handle.id, command: "toggle-popover", "aria-haspopup": "menu" };
}

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

export function Menu({ menu, label, items, class: cls = "", onClose }: MenuProps) {
  const { menuRef, anchorRef, request, opens } = menu;

  // 右クリック: 押した位置にアンカーを置いて開く。項目は描いたあとなので、先頭の項目にフォーカスが入る
  useEffect(() => {
    const el = menuRef.current;
    const anchor = anchorRef.current;
    if (request === null) return;
    if (el === null || anchor === null) {
      opens.settle(request.seq);
      return;
    }
    anchor.style.left = `${request.x}px`;
    anchor.style.top = `${request.y}px`;
    if (el.matches(":popover-open")) el.hidePopover();
    // 閉じると beforetoggle で外す。前のメニューを閉じたあとに付ける
    el.dataset.at = "";
    el.showPopover({ source: anchor });
    opens.settle(request.seq);
  }, [request?.seq]);

  const hide = () => menuRef.current?.hidePopover();

  return (
    <>
      <span ref={anchorRef} class="ui-menu-anchor" />
      <dialog
        id={menu.id}
        ref={menuRef}
        class={`ui-menu ${cls}`.trim()}
        popover="auto"
        aria-label={label}
        onKeyDown={moveInMenu}
        onBeforeToggle={(e) => {
          // toggle と違い、閉じるその時に来る（あとから来て、次に右クリックで開いたメニューの data-at を消さない）
          if (e.newState === "closed") delete e.currentTarget.dataset.at;
        }}
        onToggle={(e) => {
          // 次の右クリックを待っている間に来た、前のメニューの閉じた知らせでは呼ばない（menu-rules の createOpenCount）
          if (e.newState === "closed" && opens.settled()) onClose?.();
        }}
      >
        <div class="ui-menu-list">
          {items.map((item, i) => {
            const key = item.key ?? i;
            if (item.kind === "separator") return <hr key={key} class="ui-menu-sep" />;
            const icon = item.icon !== undefined && <span class={`ui-ico ${item.icon}`} aria-hidden="true" />;
            if (item.kind === "link") {
              return (
                <a key={key} href={item.href} target="_blank" rel="noopener noreferrer" onClick={hide}>
                  {icon}
                  {item.label}
                </a>
              );
            }
            const classes = [item.danger ? "ui-danger" : "", item.checked !== undefined ? "ui-menu-check" : ""].filter(Boolean).join(" ");
            return (
              <button
                key={key}
                type="button"
                class={classes || undefined}
                aria-pressed={item.checked}
                onClick={() => {
                  hide();
                  item.onSelect();
                }}
              >
                {icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </dialog>
    </>
  );
}
