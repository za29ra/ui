/**
 * 通知の購読の状態と、購読の鍵の取り出し。DOM に触る操作は `use-push.ts`
 */

/** サーバーに登録する購読（endpoint と、base64url にした鍵） */
export interface PushSubscribeRequest {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** base64url（パディングなし） */
export function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * unsupported: このブラウザは Push に対応していない
 * needs-install: iOS の Safari で、ホーム画面に追加していない（追加したアプリでだけ使える）
 * denied: 通知の権限が拒否されている
 * off / on: この端末は通知を受け取っていない / 受け取っている
 */
export type PushStatus = "unsupported" | "needs-install" | "denied" | "off" | "on";

export interface PushEnv {
  /** Service Worker・PushManager・Notification がそろっているか。iOS の Safari（ホーム画面に追加する前）では PushManager がない */
  supported: boolean;
  ios: boolean;
  standalone: boolean;
  permission: "default" | "granted" | "denied";
  subscribed: boolean;
}

export function pushStatus(e: PushEnv): PushStatus {
  if (!e.supported) return e.ios && !e.standalone ? "needs-install" : "unsupported";
  if (e.permission === "denied") return "denied";
  // 権限を取り消されると購読が残ることがある。権限がなければ受け取れない
  return e.subscribed && e.permission === "granted" ? "on" : "off";
}

/** PushSubscription のうち使う部分 */
export interface SubscriptionLike {
  endpoint: string;
  getKey(name: "p256dh" | "auth"): ArrayBuffer | null;
}

export function subscribeRequest(sub: SubscriptionLike): PushSubscribeRequest {
  const p256dh = sub.getKey("p256dh");
  const auth = sub.getKey("auth");
  if (!p256dh || !auth) throw new Error("購読の鍵を取り出せません");
  return { endpoint: sub.endpoint, keys: { p256dh: b64urlEncode(new Uint8Array(p256dh)), auth: b64urlEncode(new Uint8Array(auth)) } };
}

/**
 * 購読に使った公開鍵（sub.options.applicationServerKey）が、今のサーバーの公開鍵と同じか。
 * 違えば（VAPID の鍵を入れ替えた）、その購読にはもう届かないので、購読し直す。鍵が読めない（null）ときは同じとみなす
 */
export function sameKey(subscribed: ArrayBuffer | ArrayBufferView | null | undefined, current: Uint8Array): boolean {
  if (!subscribed) return true;
  const a = ArrayBuffer.isView(subscribed) ? new Uint8Array(subscribed.buffer, subscribed.byteOffset, subscribed.byteLength) : new Uint8Array(subscribed);
  return a.length === current.length && a.every((v, i) => v === current[i]);
}
