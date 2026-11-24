/**
 * 入力などをシートで出すか、ダイアログで出すか。アプリのレイアウトの境目とは別の境目。
 * スマホかどうかは画面の短い辺で決める（横向きの iPhone はシートのまま）。広い端末でも、窓が細ければシート。
 * 画面の短い辺は CSS で取れないので、<html> の dialogs のクラスにしてアプリの CSS に渡す
 */
/** 画面の短い辺か、窓の幅がこれ未満ならシート */
export const SHEET_MAX_PX = 600;
/** screenShort は min(screen.width, screen.height)、windowWidth は窓の幅（innerWidth） */
export function usesDialog(screenShort, windowWidth) {
    return screenShort >= SHEET_MAX_PX && windowWidth >= SHEET_MAX_PX;
}
/** 今ダイアログで出すか（イベントの処理の中などで） */
export function isDialogLayout() {
    return usesDialog(Math.min(screen.width, screen.height), innerWidth);
}
/** <html> のクラスを今の形に合わせ、窓の大きさが変わったら追う。描画の前に 1 回だけ呼ぶ（最初の描画でシートが開くことがある） */
export function watchDialogLayout() {
    const update = () => document.documentElement.classList.toggle("dialogs", isDialogLayout());
    update();
    addEventListener("resize", update);
}
