import { type PushStatus, type PushSubscribeRequest } from "./push.ts";
export interface PushControl {
    /** 読み込み中は null */
    status: PushStatus | null;
    busy: boolean;
    enable(): void;
    disable(): void;
}
/** アプリの API のうち、通知の購読に使う部分（アプリの API の呼び出しをそのまま渡せる形） */
export interface PushApi {
    pushConfig(): Promise<{
        vapidPublicKey: string;
    }>;
    subscribePush(body: PushSubscribeRequest): Promise<unknown>;
    unsubscribePush(endpoint: string): Promise<unknown>;
}
export declare function usePush(api: PushApi, notify: (text: string) => void): PushControl;
