/**
 * メニュー（メニューの部品 ui/menu）の決まり: キーボードで動かすときの次の項目と、右クリックで開く時機。
 * DOM の型だけを使い、Preact は読まない（アプリの node --test から読めるように）
 */
/**
 * メニューをキーボードで動かすときの、次に移る項目。
 * ↓↑ は 1 つずつ動き、端では反対の端へ回る。Home・End は先頭・末尾。
 * フォーカスが項目にないとき（current = -1）は、↓ で先頭、↑ で末尾へ
 */
export function nextMenuIndex(key, current, count) {
    if (count === 0)
        return null;
    switch (key) {
        case "ArrowDown":
            return current < 0 ? 0 : (current + 1) % count;
        case "ArrowUp":
            return current < 0 ? count - 1 : (current - 1 + count) % count;
        case "Home":
            return 0;
        case "End":
            return count - 1;
        default:
            return null;
    }
}
/**
 * ↓↑・Home・End で項目のあいだを動く（メニューの keydown に付ける）。
 * 開くと最初の項目（autofocus があればその項目）にフォーカスが入る・Enter/Space で選ぶ・Esc で閉じて開いたボタンへ戻るのは、
 * <dialog popover> の標準の動き。ここでは項目どうしの移動だけを足す。
 * 項目はメニューの中の button とリンク
 */
export function moveInMenu(e) {
    const items = [...e.currentTarget.querySelectorAll("button, a[href]")];
    const next = nextMenuIndex(e.key, items.indexOf(document.activeElement), items.length);
    if (next === null)
        return;
    e.preventDefault();
    items[next].focus();
}
/**
 * contextmenu のときにマウスのボタンを押したままか（Mac は押したときに contextmenu が来る）。
 * popover の light dismiss は、開く前の pointerdown を覚えていないので、押している間に開くと離したときの pointerup で閉じる。
 * そのときは離してから開く
 */
export function opensOnRelease(buttons) {
    return buttons !== 0;
}
/**
 * ボタンを離したら（pointerup）、light dismiss が終わってから run する。
 * 離す前に pointercancel・ウィンドウの blur（ウィンドウの外で離したときなど）・次の pointerdown が来たら、開かずに見張りを外し、onCancel を呼ぶ
 * （残すと、あとの左クリックの pointerup で古いメニューが開く）
 */
export function afterRelease(win, run, defer = (f) => setTimeout(f), onCancel) {
    const opts = { capture: true };
    const stop = () => {
        win.removeEventListener("pointerup", release, opts);
        for (const type of CANCELS)
            win.removeEventListener(type, cancel, opts);
    };
    function release() {
        stop();
        defer(run);
    }
    function cancel() {
        stop();
        onCancel?.();
    }
    win.addEventListener("pointerup", release, opts);
    for (const type of CANCELS)
        win.addEventListener(type, cancel, opts);
}
const CANCELS = ["pointercancel", "blur", "pointerdown"];
export function createOpenCount() {
    let requested = 0;
    let shown = 0;
    return {
        request: () => ++requested,
        settle: (n) => {
            shown = Math.max(shown, n);
        },
        settled: () => requested === shown,
    };
}
