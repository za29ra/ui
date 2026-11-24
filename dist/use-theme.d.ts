import type { StorageLike } from "./storage.ts";
import { type ResolvedTheme, type ThemePrefs } from "./theme.ts";
export interface ThemeState {
    prefs: ThemePrefs;
    resolved: ResolvedTheme;
    change(next: ThemePrefs): void;
}
export declare function useTheme(app: string, storage: () => StorageLike): ThemeState;
