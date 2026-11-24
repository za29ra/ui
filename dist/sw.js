/**
 * Service Worker の共通の部分（DESIGN.md 2.6・4 章）。アプリの Service Worker が import して使う（別ビルドの iife に入るので、DOM と Preact を読まない）。
 * Push を受けたら必ず通知を出す（出さない push が続くと iOS は購読を取り消す）のは、各アプリの push の処理で守る。
 * 型は ServiceWorkerGlobalScope に頼らず、使う部分だけで受ける
 */
/** 通知の data からタップで開くパス。アプリのパスでなければ "/" */
export function notificationPath(data, isAppPath) {
    const path = data !== null && typeof data === "object" ? data.path : undefined;
    return typeof path === "string" && isAppPath(path) ? path : "/";
}
/**
 * 通知をタップしたとき: 開いているウィンドウがあれば遷移を頼んで前に出し、無ければ開く。
 * PC でタブが複数あるときは、見えているタブを移す
 */
export async function openOrFocus(clients, path) {
    const list = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = list.find((c) => c.focused || c.visibilityState === "visible") ?? list[0];
    if (existing) {
        // navigate() は Safari で当てにならないので、画面にメッセージで遷移を頼む（register-sw.ts の listenNavigate が受ける）。
        // 先に送る: focus() は Safari で reject することがあり、失敗でも遷移の頼みは届けたい
        existing.postMessage({ type: "navigate", path });
        try {
            await existing.focus();
        }
        catch {
            // 前面に出せなくても、画面は遷移する
        }
        return;
    }
    await clients.openWindow(path);
}
