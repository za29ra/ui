/**
 * 通知の購読の状態と、購読の鍵の取り出し。DOM に触る操作は `use-push.ts`
 */
/** サーバーに登録する購読（endpoint と、base64url にした鍵） */
export interface PushSubscribeRequest {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
/** base64url（パディングなし） */
export declare function b64urlEncode(bytes: Uint8Array): string;
export declare function b64urlDecode(s: string): Uint8Array<ArrayBuffer>;
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
export declare function pushStatus(e: PushEnv): PushStatus;
/** PushSubscription のうち使う部分 */
export interface SubscriptionLike {
    endpoint: string;
    getKey(name: "p256dh" | "auth"): ArrayBuffer | null;
}
export declare function subscribeRequest(sub: SubscriptionLike): PushSubscribeRequest;
/**
 * 購読に使った公開鍵（sub.options.applicationServerKey）が、今のサーバーの公開鍵と同じか。
 * 違えば（VAPID の鍵を入れ替えた）、その購読にはもう届かないので、購読し直す。鍵が読めない（null）ときは同じとみなす
 */
export declare function sameKey(subscribed: ArrayBuffer | ArrayBufferView | null | undefined, current: Uint8Array): boolean;
