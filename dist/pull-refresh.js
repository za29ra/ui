import { jsx as _jsx } from "preact/jsx-runtime";
/**
 * プルダウンで読み直す。ホーム画面から開いたスマホの幅（1 列のとき）だけ。
 * standalone にはブラウザの更新ボタンもネイティブのプルダウン更新もないので、ページの先頭で下に引いたら取り直す。
 * 見た目は、背景のある丸いバッジ。引くにつれて矢印が回り、引き切ったら色が変わり、離したら読み込みが終わるまでスピナーを回す（components.css の .ui-pull。状態は data-state）
 */
import { useEffect, useRef, useState } from "preact/hooks";
import { arrowAngle, isScrollContainer, PULL_TRIGGER, pullAxis, pullDistance, pullProgress, pullReady, refreshDone } from "./pull.js";
import { isStandalone } from "./pwa.js";
export const DEFAULT_BLOCK = "dialog[open], dialog:modal";
const pageScroller = () => document.scrollingElement;
/**
 * 引き始めてはいけない状況か。block に当たる要素（開いている dialog など）がある、
 * または触れた場所が（ページの枠以外の）スクロールできる領域の中。領域の中は scrollTop の値によらず対象外にする
 */
export function blocked(target, block = DEFAULT_BLOCK, scroller = pageScroller) {
    if (document.querySelector(block))
        return true;
    const page = scroller();
    for (let el = target instanceof Element ? target : null; el && el !== document.body && el !== document.documentElement && el !== page; el = el.parentElement) {
        const cs = getComputedStyle(el);
        if (isScrollContainer({ overflowX: cs.overflowX, overflowY: cs.overflowY, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
            return true;
    }
    return false;
}
export function PullRefresh(props) {
    const { loading } = props;
    const [distance, setDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    // props は effect の中で ref から読む（描画のたびに新しい関数や文字列でも、リスナーを付け直さない）
    const latest = useRef(props);
    latest.current = props;
    const loadingRef = useRef(loading);
    loadingRef.current = loading;
    const refreshingRef = useRef(false);
    const startedAt = useRef(0);
    // 更新中の表示を閉じる時を見る（読み込みが終わり、最低限の時間がたったら）
    useEffect(() => {
        if (!refreshing)
            return;
        const check = () => {
            if (!refreshDone(Date.now(), startedAt.current, loadingRef.current))
                return;
            refreshingRef.current = false;
            setRefreshing(false);
        };
        const id = setInterval(check, 100);
        return () => clearInterval(id);
    }, [refreshing]);
    useEffect(() => {
        // 指を置いた位置。引き始められない状況（先頭でない・モーダルが開いている・対象外）のときは null
        let start = null;
        let startX = 0;
        // 縦の引きと決まったか（決まるまでは preventDefault しない。横スクロールを邪魔しない）
        let vertical = false;
        let current = 0;
        const set = (d) => {
            current = d;
            setDistance(d);
        };
        const scroller = () => (latest.current.scroller ?? pageScroller)();
        // ページの枠のスクロール位置。既定の枠（document.scrollingElement）では scrollY と同じ
        const scrollTop = () => scroller()?.scrollTop ?? scrollY;
        const onStart = (e) => {
            const p = latest.current;
            // 更新中は、続けて引かない
            const ok = !refreshingRef.current && e.touches.length === 1 && scrollTop() <= 0 && matchMedia(p.media).matches && isStandalone() && !blocked(e.target, p.block, scroller);
            start = ok ? e.touches[0].clientY : null;
            startX = ok ? e.touches[0].clientX : 0;
            vertical = false;
        };
        const onMove = (e) => {
            if (start === null)
                return;
            if (!vertical) {
                const axis = pullAxis(e.touches[0].clientX - startX, e.touches[0].clientY - start);
                if (axis === null)
                    return;
                if (!axis) {
                    start = null;
                    return;
                }
                vertical = true;
            }
            const d = pullDistance(start, e.touches[0].clientY);
            if (d <= 0 || scrollTop() > 0) {
                start = null;
                set(0);
                return;
            }
            // 引いている間は、ページが一緒に伸びる（ラバーバンド）のを止める
            if (e.cancelable)
                e.preventDefault();
            set(d);
        };
        const onEnd = () => {
            const ready = start !== null && pullReady(current);
            start = null;
            set(0);
            if (!ready)
                return;
            refreshingRef.current = true;
            startedAt.current = Date.now();
            setRefreshing(true);
            latest.current.onRefresh();
        };
        const onCancel = () => {
            start = null;
            set(0);
        };
        document.addEventListener("touchstart", onStart, { passive: true });
        // preventDefault するので passive にしない
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onEnd);
        document.addEventListener("touchcancel", onCancel);
        return () => {
            document.removeEventListener("touchstart", onStart);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onEnd);
            document.removeEventListener("touchcancel", onCancel);
        };
    }, []);
    if (distance === 0 && !refreshing)
        return null;
    // 更新中は、トリガーの位置に止めて回す。引いている間は指に付いてくる
    const offset = refreshing ? PULL_TRIGGER : distance;
    const ready = !refreshing && pullReady(distance);
    return (_jsx("div", { class: "ui-pull", "data-state": refreshing ? "refreshing" : ready ? "ready" : undefined, 
        // 上の見えない位置から降りてくる。丸の大きさ（40px）+ 余白ぶん上に置いておく
        style: { transform: `translateY(${offset - 52}px)`, opacity: refreshing ? 1 : pullProgress(distance) }, role: "status", "aria-label": refreshing ? "更新しています" : ready ? "離すと更新" : "引いて更新", children: _jsx("span", { class: "ui-pull-circle", children: refreshing ? (_jsx("svg", { class: "ui-pull-spinner", viewBox: "0 0 24 24", width: "22", height: "22", "aria-hidden": "true", children: _jsx("circle", { cx: "12", cy: "12", r: "9", fill: "none", stroke: "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-dasharray": "40 100" }) })) : (_jsx("svg", { viewBox: "0 0 24 24", width: "22", height: "22", "aria-hidden": "true", style: { transform: `rotate(${arrowAngle(distance)}deg)` }, children: _jsx("path", { d: "M12 5v14M5 12l7 7 7-7", fill: "none", stroke: "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" }) })) }) }));
}
