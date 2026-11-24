/**
 * 配信中の版の確かめ。ビルドごとの ID をアプリが /version.json に出し、画面に埋め込んだ ID と比べる（update-check.ts が知らせる）。
 * PWA は前面に戻っても読み込み直さないので、デプロイのあとも古い画面が動き続ける
 */
export const VERSION_PATH = "/version.json";
/** version.json の中身からビルドの ID を取り出す。形が違えば null */
export function buildIdOf(data) {
    if (data === null || typeof data !== "object")
        return null;
    const id = data.buildId;
    return typeof id === "string" && id !== "" ? id : null;
}
/**
 * 配信中の版が current と違うか。取れないとき（オフライン・ログインの期限切れでログイン画面に回された・JSON でない）は false。
 * HTTP のキャッシュに古い version.json が残っていると気づけないので、no-store で取る
 */
export async function hasNewVersion(fetchFn, current) {
    try {
        const res = await fetchFn(VERSION_PATH, { cache: "no-store" });
        if (!res.ok)
            return false;
        const id = buildIdOf(await res.json());
        return id !== null && id !== current;
    }
    catch {
        return false;
    }
}
