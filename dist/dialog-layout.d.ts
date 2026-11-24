/**
 * 入力などをシートで出すか、ダイアログで出すか。アプリのレイアウトの境目とは別の境目。
 * スマホかどうかは画面の短い辺で決める（横向きの iPhone はシートのまま）。広い端末でも、窓が細ければシート。
 * 画面の短い辺は CSS で取れないので、<html> の dialogs のクラスにしてアプリの CSS に渡す
 */
/** 画面の短い辺か、窓の幅がこれ未満ならシート */
export declare const SHEET_MAX_PX = 600;
/** screenShort は min(screen.width, screen.height)、windowWidth は窓の幅（innerWidth） */
export declare function usesDialog(screenShort: number, windowWidth: number): boolean;
/** 今ダイアログで出すか（イベントの処理の中などで） */
export declare function isDialogLayout(): boolean;
/** <html> のクラスを今の形に合わせ、窓の大きさが変わったら追う。描画の前に 1 回だけ呼ぶ（最初の描画でシートが開くことがある） */
export declare function watchDialogLayout(): void;
