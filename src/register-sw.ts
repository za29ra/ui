/**
 * Service Worker の登録と、通知のタップで頼まれる遷移の受信。
 * 登録の失敗（非対応・HTTP など）は画面の動作に影響させない
 */
import { navigatePath } from "./sw-message.ts";

export function registerServiceWorker(url = "/sw.js"): void {
  if (!("serviceWorker" in navigator)) return;
  addEventListener("load", () => {
    navigator.serviceWorker.register(url).catch(() => {});
  });
}

/** 通知をタップしたとき、開いているウィンドウに Service Worker が遷移を頼む。解除する関数を返す */
export function listenNavigate(isAppPath: (path: string) => boolean, handler: (path: string) => void): () => void {
  if (!("serviceWorker" in navigator)) return () => {};
  const on = (e: MessageEvent) => {
    const path = navigatePath(e.data, isAppPath);
    if (path !== null) handler(path);
  };
  navigator.serviceWorker.addEventListener("message", on);
  return () => navigator.serviceWorker.removeEventListener("message", on);
}
