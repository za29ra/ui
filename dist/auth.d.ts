/**
 * ログインの期限切れ。API の代わりにログイン画面への転送（`redirect: "manual"` では opaqueredirect）か HTML が返る。
 * 呼ぶ側は転送をたどらない（`redirect: "manual"`）で取る。たどるとログイン画面の HTML を API の応答として受けてしまう
 */
import { type StorageLike } from "./storage.ts";
/** fetch の応答のうち、ログイン切れの判定に使う部分 */
export interface ResponseHead {
    type: string;
    status: number;
    headers: {
        get(name: string): string | null;
    };
}
/** 応答がログイン切れか: 転送（opaqueredirect）・401・5xx でない JSON 以外 */
export declare function authExpired(res: ResponseHead): boolean;
/** ログインの期限切れで読み込み直す間隔の下限 */
export declare const RELOAD_INTERVAL_MS = 60000;
/**
 * ページを読み込み直してログインに回す。1 分に 1 回まで
 * （設定の誤りで API が 401 を返し続けるときに、読み込み直しを繰り返さないため）。読み込み直したら true
 */
export declare function reloadOnce(app: string, storage: () => StorageLike, now: number, reload: () => void): boolean;
