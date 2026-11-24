/**
 * 配信中の版の確かめ。ビルドごとの ID をアプリが /version.json に出し、画面に埋め込んだ ID と比べる（update-check.ts が知らせる）。
 * PWA は前面に戻っても読み込み直さないので、デプロイのあとも古い画面が動き続ける
 */
export declare const VERSION_PATH = "/version.json";
/** version.json の中身からビルドの ID を取り出す。形が違えば null */
export declare function buildIdOf(data: unknown): string | null;
/**
 * 配信中の版が current と違うか。取れないとき（オフライン・ログインの期限切れでログイン画面に回された・JSON でない）は false。
 * HTTP のキャッシュに古い version.json が残っていると気づけないので、no-store で取る
 */
export declare function hasNewVersion(fetchFn: (url: string, init: RequestInit) => Promise<Response>, current: string): Promise<boolean>;
