/**
 * Service Worker の共通の部分（DESIGN.md 2.6・4 章）。アプリの Service Worker が import して使う（別ビルドの iife に入るので、DOM と Preact を読まない）。
 * Push を受けたら必ず通知を出す（出さない push が続くと iOS は購読を取り消す）のは、各アプリの push の処理で守る。
 * 型は ServiceWorkerGlobalScope に頼らず、使う部分だけで受ける
 */
export interface ClientLike {
    focused: boolean;
    visibilityState: string;
    postMessage(message: unknown): void;
    focus(): Promise<unknown>;
}
export interface ClientsLike {
    matchAll(options: {
        type: "window";
        includeUncontrolled: boolean;
    }): Promise<readonly ClientLike[]>;
    openWindow(url: string): Promise<unknown>;
}
/** 通知の data からタップで開くパス。アプリのパスでなければ "/" */
export declare function notificationPath(data: unknown, isAppPath: (path: string) => boolean): string;
/**
 * 通知をタップしたとき: 開いているウィンドウがあれば遷移を頼んで前に出し、無ければ開く。
 * PC でタブが複数あるときは、見えているタブを移す
 */
export declare function openOrFocus(clients: ClientsLike, path: string): Promise<void>;
