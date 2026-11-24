export interface PullRefreshProps {
    onRefresh(): void;
    /** 一覧を読み込み中か。離したあと、これが終わるまで（最低限の時間は）更新中の表示を続ける */
    loading: boolean;
    /** 引ける画面の幅（アプリの 1 列のレイアウトのメディアクエリ。例 "(width < 900px)"） */
    media: string;
    /** 開いていたら引かない要素のセレクタ。既定は開いている dialog（`DEFAULT_BLOCK`）。アプリの状態（ドラッグ中など）を足すときは DEFAULT_BLOCK に続けて書く */
    block?: string;
    /** ページが流れる枠。既定は document.scrollingElement（ページ自体がスクロールする） */
    scroller?: () => Element | null;
}
export declare const DEFAULT_BLOCK = "dialog[open], dialog:modal";
/**
 * 引き始めてはいけない状況か。block に当たる要素（開いている dialog など）がある、
 * または触れた場所が（ページの枠以外の）スクロールできる領域の中。領域の中は scrollTop の値によらず対象外にする
 */
export declare function blocked(target: EventTarget | null, block?: string, scroller?: () => Element | null): boolean;
export declare function PullRefresh(props: PullRefreshProps): import("preact").JSX.Element | null;
