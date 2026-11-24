/**
 * 端末に覚える値（localStorage）。キーは `<アプリ名>.<キー>`（DESIGN.md 3.8）。
 * storage は関数で受ける（localStorage を読むだけで例外になるブラウザがあるため）
 */
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export declare function appKey(app: string, key: string): string;
