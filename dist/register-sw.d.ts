export declare function registerServiceWorker(url?: string): void;
/** 通知をタップしたとき、開いているウィンドウに Service Worker が遷移を頼む。解除する関数を返す */
export declare function listenNavigate(isAppPath: (path: string) => boolean, handler: (path: string) => void): () => void;
