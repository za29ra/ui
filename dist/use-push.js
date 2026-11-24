/**
 * この端末の Push 通知の購読（設定の「通知」）。権限の要求はユーザーの操作から行う。
 * 起動時に購読があればサーバーに登録し直す（冪等）。サーバーが 410 で消したあとや、VAPID の鍵を入れ替えたあとに、黙って通知が止まるのを防ぐ
 */
import { useEffect, useState } from "preact/hooks";
import { b64urlDecode, pushStatus, sameKey, subscribeRequest } from "./push.js";
import { isIos, isStandalone } from "./pwa.js";
function supported() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
async function currentSubscription() {
    if (!supported())
        return null;
    // ready は登録がないと解決しない。登録がなければ購読もない
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? reg.pushManager.getSubscription() : null;
}
async function readStatus() {
    const sub = await currentSubscription();
    return pushStatus({
        supported: supported(),
        ios: isIos(),
        standalone: isStandalone(),
        permission: "Notification" in window ? Notification.permission : "default",
        subscribed: sub !== null,
    });
}
/**
 * 今の公開鍵での購読を返す。購読がなければ作り、古い鍵の購読（VAPID の鍵を入れ替えた）は取り消して作り直す。
 * 権限が granted のときだけ呼ぶ（権限のダイアログは出ない）
 */
async function ensureSubscription(reg, vapidPublicKey) {
    const key = b64urlDecode(vapidPublicKey);
    let sub = await reg.pushManager.getSubscription();
    if (sub && !sameKey(sub.options.applicationServerKey, key)) {
        await sub.unsubscribe();
        sub = null;
    }
    return sub ?? reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
}
async function enablePush(api) {
    // 権限の要求は最初の await にする（iOS は、ユーザーの操作から離れた要求を拒否する）
    const permission = await Notification.requestPermission();
    if (permission !== "granted")
        return;
    const { vapidPublicKey } = await api.pushConfig();
    const reg = await navigator.serviceWorker.ready;
    const sub = await ensureSubscription(reg, vapidPublicKey);
    await api.subscribePush(subscribeRequest(sub));
}
async function disablePush(api) {
    const sub = await currentSubscription();
    if (!sub)
        return;
    // サーバーを先に消す（失敗したら購読は残り、やり直せる）
    await api.unsubscribePush(sub.endpoint);
    await sub.unsubscribe();
}
export function usePush(api, notify) {
    const [status, setStatus] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        (async () => {
            setStatus(await readStatus());
            const sub = await currentSubscription();
            if (sub && Notification.permission === "granted") {
                // 鍵を入れ替えていたら、新しい鍵で購読し直してから登録する
                const { vapidPublicKey } = await api.pushConfig();
                const reg = await navigator.serviceWorker.ready;
                await api.subscribePush(subscribeRequest(await ensureSubscription(reg, vapidPublicKey)));
                setStatus(await readStatus());
            }
        })().catch(() => { });
    }, []);
    async function run(action, failure) {
        setBusy(true);
        try {
            await action();
        }
        catch {
            notify(failure);
        }
        finally {
            setStatus(await readStatus().catch(() => "off"));
            setBusy(false);
        }
    }
    return {
        status,
        busy,
        enable: () => void run(() => enablePush(api), "通知を有効にできませんでした"),
        disable: () => void run(() => disablePush(api), "通知を止められませんでした"),
    };
}
