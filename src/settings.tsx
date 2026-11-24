/**
 * 設定の部品（DESIGN.md 2.1・4 章）。
 * - SettingsLayout: 上のタブと本文の枠だけ。開いている項目と URL の結び付け（/settings/<項目>）はアプリが持つ
 * - ThemeSettings: 表示（自動 | ライト | ダーク）と、ライト・ダークのテーマのカード。カードの見本の中身はアプリが preview(id) で渡す
 * - NotifySettings: この端末の通知の状態と、受け取る・やめるのスイッチ。文言は settings-text.ts（アプリ別の部分は props）
 * アイコン（カードのチェック・通知の状態）は props で受ける（アイコンの仕組みは 3c-3）
 */
import { useId } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { DARK_THEMES, LIGHT_THEMES, MODES, type ThemeId, type ThemePrefs } from "./theme.ts";
import type { PushControl } from "./use-push.ts";
import { pushStateText, type PushIconName } from "./settings-text.ts";

export * from "./settings-text.ts";

export interface SettingsLayoutProps<T extends string> {
  tabs: Array<{ id: T; name: string }>;
  current: T;
  onTab(tab: T): void;
  /** タブの並びの aria-label（既定は「設定の項目」） */
  label?: string;
  /** ui-settings の後ろに足す class */
  class?: string;
  children: ComponentChildren;
}

export function SettingsLayout<T extends string>({ tabs, current, onTab, label = "設定の項目", class: cls = "", children }: SettingsLayoutProps<T>) {
  return (
    <div class={`ui-settings ${cls}`.trim()}>
      <div class="ui-tabs" role="group" aria-label={label}>
        {tabs.map((t) => (
          <button key={t.id} type="button" aria-pressed={current === t.id} onClick={() => onTab(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
      <div class="ui-settings-body">{children}</div>
    </div>
  );
}

function ThemeChoices<T extends ThemeId>(p: { legend: string; name: string; themes: Array<{ id: T; name: string }>; value: T; onChange(id: T): void; preview(id: ThemeId): ComponentChildren; checkIcon?: ComponentChildren }) {
  return (
    <fieldset class="ui-settings-group">
      <legend>{p.legend}</legend>
      <div class="ui-theme-grid">
        {p.themes.map((t) => (
          <label key={t.id} class="ui-theme-card">
            <input type="radio" name={p.name} value={t.id} checked={p.value === t.id} onChange={() => p.onChange(t.id)} />
            {/* 見本。data-theme を付けた要素の中だけ、そのテーマの色になる */}
            <span class="ui-theme-preview" data-theme={t.id} aria-hidden="true">
              {p.preview(t.id)}
            </span>
            <span class="ui-theme-card-name">
              {t.name}
              {p.checkIcon !== undefined && (
                <span class="ui-theme-card-check" aria-hidden="true">
                  {p.checkIcon}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export interface ThemeSettingsProps {
  theme: ThemePrefs;
  onTheme(next: ThemePrefs): void;
  /** テーマのカードの見本の中身（ドメインの形を小さく描く）。枠（.ui-theme-preview）は部品が描く */
  preview(id: ThemeId): ComponentChildren;
  /** 選んだカードの名前の横に出す印（無ければ出さない） */
  checkIcon?: ComponentChildren;
}

export function ThemeSettings({ theme, onTheme, preview, checkIcon }: ThemeSettingsProps) {
  const id = useId();
  return (
    <>
      <div class="ui-settings-group">
        <span id={`${id}-mode`}>表示</span>
        <div class="ui-segmented" role="group" aria-labelledby={`${id}-mode`}>
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={theme.mode === m.id} onClick={() => onTheme({ ...theme, mode: m.id })}>
              {m.name}
            </button>
          ))}
        </div>
        <p class="ui-settings-note">「自動」は端末の外観に合わせます。起動中の画面だけは、この設定によらず端末の外観で決まります。</p>
      </div>
      <ThemeChoices legend="ライトのテーマ" name={`${id}-light`} themes={LIGHT_THEMES} value={theme.light} onChange={(light) => onTheme({ ...theme, light })} preview={preview} checkIcon={checkIcon} />
      <ThemeChoices legend="ダークのテーマ" name={`${id}-dark`} themes={DARK_THEMES} value={theme.dark} onChange={(dark) => onTheme({ ...theme, dark })} preview={preview} checkIcon={checkIcon} />
    </>
  );
}

export interface NotifySettingsProps {
  push: PushControl;
  /** アプリの表示名（許可されていないときの説明に出す） */
  appName: string;
  /** 通知を受け取っているときの説明（何を知らせるか） */
  onDetail: string;
  /** 状態のアイコン（無ければ出さない） */
  icons?: Partial<Record<PushIconName, ComponentChildren>>;
}

export function NotifySettings({ push, appName, onDetail, icons }: NotifySettingsProps) {
  const text = push.status === null ? null : pushStateText(push.status, { appName, onDetail });
  const icon = text === null ? undefined : icons?.[text.icon];
  return (
    <div class="ui-settings-group">
      <span>この端末の通知</span>
      {/* 状態は色とアイコンでも見分けられるようにする（data-state） */}
      <div class="ui-push-status" role="status" data-state={push.status ?? "checking"}>
        {text === null ? (
          <p class="ui-settings-note">確認中…</p>
        ) : (
          <>
            {icon !== undefined && (
              <span class="ui-push-status-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              <p class="ui-push-status-title">{text.title}</p>
              <p class="ui-push-status-detail">{text.detail}</p>
            </div>
          </>
        )}
      </div>
      {/* 受け取る・やめるは iOS のようなスイッチで切り替える（受け取れる状態のときだけ出す） */}
      {(push.status === "on" || push.status === "off") && (
        <label class="ui-switch-row">
          <span>この端末で通知を受け取る</span>
          <input type="checkbox" role="switch" class="ui-switch" checked={push.status === "on"} disabled={push.busy} onChange={(e) => (e.currentTarget.checked ? push.enable() : push.disable())} />
        </label>
      )}
    </div>
  );
}
