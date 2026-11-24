/**
 * ログインの期限切れ。API の代わりにログイン画面への転送（`redirect: "manual"` では opaqueredirect）か HTML が返る。
 * 呼ぶ側は転送をたどらない（`redirect: "manual"`）で取る。たどるとログイン画面の HTML を API の応答として受けてしまう
 */
import { appKey } from "./storage.js";
/** 応答がログイン切れか: 転送（opaqueredirect）・401・5xx でない JSON 以外 */
export function authExpired(res) {
    const isJson = (res.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");
    return res.type === "opaqueredirect" || res.status === 401 || (!isJson && res.status < 500);
}
/** ログインの期限切れで読み込み直す間隔の下限 */
export const RELOAD_INTERVAL_MS = 60_000;
/**
 * ページを読み込み直してログインに回す。1 分に 1 回まで
 * （設定の誤りで API が 401 を返し続けるときに、読み込み直しを繰り返さないため）。読み込み直したら true
 */
export function reloadOnce(app, storage, now, reload) {
    const key = appKey(app, "reloadedAt");
    try {
        const s = storage();
        const raw = s.getItem(key);
        // 記録が無ければ、初めての読み込み直し
        const last = raw === null ? Number.NaN : Number(raw);
        // 先の時刻や壊れた値は、記録が無いものとして扱う（時計のずれで読み込み直せなくならないように）
        const elapsed = now - last;
        if (Number.isFinite(last) && elapsed >= 0 && elapsed < RELOAD_INTERVAL_MS)
            return false;
        s.setItem(key, String(now));
    }
    catch {
        // 時刻を記録できないと繰り返しを止められないので、読み込み直さない
        return false;
    }
    reload();
    return true;
}
