/**
 * メニュー（メニューの部品 ui/menu）の決まり: キーボードで動かすときの次の項目と、右クリックで開く時機。
 * DOM の型だけを使い、Preact は読まない（アプリの node --test から読めるように）
 */
/**
 * メニューをキーボードで動かすときの、次に移る項目。
 * ↓↑ は 1 つずつ動き、端では反対の端へ回る。Home・End は先頭・末尾。
 * フォーカスが項目にないとき（current = -1）は、↓ で先頭、↑ で末尾へ
 */
export declare function nextMenuIndex(key: string, current: number, count: number): number | null;
/**
 * ↓↑・Home・End で項目のあいだを動く（メニューの keydown に付ける）。
 * 開くと最初の項目（autofocus があればその項目）にフォーカスが入る・Enter/Space で選ぶ・Esc で閉じて開いたボタンへ戻るのは、
 * <dialog popover> の標準の動き。ここでは項目どうしの移動だけを足す。
 * 項目はメニューの中の button とリンク
 */
export declare function moveInMenu(e: KeyboardEvent): void;
/**
 * contextmenu のときにマウスのボタンを押したままか（Mac は押したときに contextmenu が来る）。
 * popover の light dismiss は、開く前の pointerdown を覚えていないので、押している間に開くと離したときの pointerup で閉じる。
 * そのときは離してから開く
 */
export declare function opensOnRelease(buttons: number): boolean;
/**
 * ボタンを離したら（pointerup）、light dismiss が終わってから run する。
 * 離す前に pointercancel・ウィンドウの blur（ウィンドウの外で離したときなど）・次の pointerdown が来たら、開かずに見張りを外す
 * （残すと、あとの左クリックの pointerup で古いメニューが開く）
 */
export declare function afterRelease(win: EventTarget, run: () => void, defer?: (f: () => void) => void): void;
