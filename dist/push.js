/**
 * 通知の購読の状態と、購読の鍵の取り出し。DOM に触る操作は `use-push.ts`
 */
/** base64url（パディングなし） */
export function b64urlEncode(bytes) {
    let bin = "";
    for (const b of bytes)
        bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function b64urlDecode(s) {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        out[i] = bin.charCodeAt(i);
    return out;
}
export function pushStatus(e) {
    if (!e.supported)
        return e.ios && !e.standalone ? "needs-install" : "unsupported";
    if (e.permission === "denied")
        return "denied";
    // 権限を取り消されると購読が残ることがある。権限がなければ受け取れない
    return e.subscribed && e.permission === "granted" ? "on" : "off";
}
export function subscribeRequest(sub) {
    const p256dh = sub.getKey("p256dh");
    const auth = sub.getKey("auth");
    if (!p256dh || !auth)
        throw new Error("購読の鍵を取り出せません");
    return { endpoint: sub.endpoint, keys: { p256dh: b64urlEncode(new Uint8Array(p256dh)), auth: b64urlEncode(new Uint8Array(auth)) } };
}
/**
 * 購読に使った公開鍵（sub.options.applicationServerKey）が、今のサーバーの公開鍵と同じか。
 * 違えば（VAPID の鍵を入れ替えた）、その購読にはもう届かないので、購読し直す。鍵が読めない（null）ときは同じとみなす
 */
export function sameKey(subscribed, current) {
    if (!subscribed)
        return true;
    const a = ArrayBuffer.isView(subscribed) ? new Uint8Array(subscribed.buffer, subscribed.byteOffset, subscribed.byteLength) : new Uint8Array(subscribed);
    return a.length === current.length && a.every((v, i) => v === current[i]);
}
