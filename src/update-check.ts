/**
 * 新しい版が配信されたら、トーストで再読み込みを勧める。
 * PWA は前面に戻っても読み込み直さず、アプリを終了するまで古い画面が動き続けるため。
 * 勝手に読み込み直すと読んでいる記事やスクロール位置が消えるので、読み込み直すのは押したときだけ
 */
import { useEffect } from "preact/hooks";
import type { Notify } from "./toast.ts";
import { hasNewVersion } from "./version.ts";

/** 前面にある間に確かめる間隔（ミリ秒） */
const INTERVAL_MS = 30 * 60 * 1000;
/** 確かめる最短の間隔（ミリ秒）。アプリの切り替えを繰り返しても取りに行きすぎない */
const MIN_GAP_MS = 60 * 1000;

/** buildId は画面に埋め込んだビルドの ID（version.json の buildId と比べる） */
export function useUpdateCheck(buildId: string, notify: Notify): void {
  useEffect(() => {
    let last = 0;
    let checking = false;
    const check = async () => {
      if (document.visibilityState !== "visible" || checking || Date.now() - last < MIN_GAP_MS) return;
      checking = true;
      last = Date.now();
      try {
        if (await hasNewVersion((url, init) => fetch(url, init), buildId)) {
          // 押すまで時間で消さない
          notify("新しいバージョンがあります", { label: "再読み込み", run: () => location.reload() }, true);
        }
      } finally {
        checking = false;
      }
    };
    const timer = setInterval(check, INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
}
