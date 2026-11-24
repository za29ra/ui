import type { ComponentChildren } from "preact";
import { type ThemeId, type ThemePrefs } from "./theme.ts";
import type { PushControl } from "./use-push.ts";
export * from "./settings-text.ts";
export interface SettingsLayoutProps<T extends string> {
    tabs: Array<{
        id: T;
        name: string;
    }>;
    current: T;
    onTab(tab: T): void;
    /** タブの並びの aria-label（既定は「設定の項目」） */
    label?: string;
    /** ui-settings の後ろに足す class */
    class?: string;
    children: ComponentChildren;
}
export declare function SettingsLayout<T extends string>({ tabs, current, onTab, label, class: cls, children }: SettingsLayoutProps<T>): import("preact").JSX.Element;
export interface ThemeSettingsProps {
    theme: ThemePrefs;
    onTheme(next: ThemePrefs): void;
    /** テーマのカードの見本の中身（ドメインの形を小さく描く）。枠（.ui-theme-preview）は部品が描く */
    preview(id: ThemeId): ComponentChildren;
}
export declare function ThemeSettings({ theme, onTheme, preview }: ThemeSettingsProps): import("preact").JSX.Element;
export interface NotifySettingsProps {
    push: PushControl;
    /** アプリの表示名（許可されていないときの説明に出す） */
    appName: string;
    /** 通知を受け取っているときの説明（何を知らせるか） */
    onDetail: string;
}
export declare function NotifySettings({ push, appName, onDetail }: NotifySettingsProps): import("preact").JSX.Element;
