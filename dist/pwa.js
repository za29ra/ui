/**
 * ホーム画面から開いたか・iOS か。DOM を読むので、テストでは呼ばない
 */
export function isIos() {
    // iPadOS は Macintosh を名乗る
    return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
export function isStandalone() {
    return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
