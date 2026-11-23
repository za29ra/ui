/**
 * 直書きの値を ui のトークンへ置き換える（開発用。配らない）。
 * 使い方: node scripts/migrate-literals.ts <file.css>
 *   ファイルを書き換え、置き換えられなかった行（残り）を stdout に出す。
 * CSS は 1 行に 1 宣言、セレクタは { で終わる行（, で終わる行が続く複数行も可）（Prettier の出力）を前提にする
 */
import { readFileSync, writeFileSync } from "node:fs";

export interface Leftover {
  line: number;
  text: string;
}

const TEXT: Array<[px: number, name: string]> = [
  [11, "2xs"], [12, "xs"], [13, "sm"], [14, "md"], [16, "base"], [18, "lg"], [22, "xl"],
];
const SPACE: Array<[px: number, name: string]> = [
  [2, "0_5"], [4, "1"], [6, "1_5"], [8, "2"], [10, "2_5"], [12, "3"], [16, "4"], [20, "5"], [24, "6"], [32, "8"],
];
const DURATION: Array<[ms: number, name: string]> = [[120, "fast"], [200, "base"], [300, "slow"]];

/** 近い段階の名前。等距離なら小さい方 */
function nearest(value: number, steps: Array<[number, string]>): string {
  let best = steps[0];
  for (const s of steps) if (Math.abs(s[0] - value) < Math.abs(best[0] - value)) best = s;
  return best[1];
}

function toPx(num: string, unit: string): number {
  return unit === "rem" ? parseFloat(num) * 16 : parseFloat(num);
}

const SPACE_PROPS = /^(padding|margin)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$|^(gap|row-gap|column-gap)$/;

/** 括弧の外のカンマで分ける（cubic-bezier(…) の中は分けない） */
function splitTopLevel(value: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      items.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  items.push(cur.trim());
  return items;
}

export function migrate(source: string): { css: string; leftovers: Leftover[] } {
  const lines = source.split("\n");
  const leftovers: Leftover[] = [];
  let selector = "";
  let pending = ""; // , で終わる複数行のセレクタの前の行
  let keyframesDepth = 0;
  let depth = 0;

  const out = lines.map((line, i) => {
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;
    const isKeyframes = /^\s*@(-\w+-)?keyframes\b/.test(line);
    if (isKeyframes) keyframesDepth = depth + 1;
    if (opens > 0) {
      selector = pending + line;
      pending = "";
    } else if (line.trim().endsWith(",")) {
      pending += line + "\n";
    } else {
      pending = "";
    }
    depth += opens - closes;
    if (keyframesDepth > 0 && depth < keyframesDepth) keyframesDepth = 0;
    if (keyframesDepth > 0 && !isKeyframes) return line;

    const m = /^(\s*)([a-z-]+)\s*:\s*(.+?);\s*$/.exec(line);
    if (m === null) return line;
    const [, indent, prop, value] = m;
    const keep = () => line;
    const set = (v: string) => `${indent}${prop}: ${v};`;
    const leftover = () => {
      leftovers.push({ line: i + 1, text: line.trim() });
      return line;
    };
    const handled =
      prop === "font-size" || SPACE_PROPS.test(prop) || prop === "border-radius" || prop === "box-shadow" || /^(transition|animation)(-duration)?$/.test(prop);
    if (handled && value.includes("!important")) return leftover(); // 上書きの意図があるので手で決める

    if (prop === "font-size") {
      const fm = /^(\d*\.?\d+)(px|rem)$/.exec(value);
      if (fm === null) return keep();
      const px = toPx(fm[1], fm[2]);
      if (px === 16 && /\b(input|textarea|select)\b/.test(selector)) return set("var(--text-input)");
      if (px < TEXT[0][0] || px > TEXT[TEXT.length - 1][0]) return leftover(); // 段階の外。端に寄せると大きさが大きく変わる
      return set(`var(--text-${nearest(px, TEXT)})`);
    }

    if (SPACE_PROPS.test(prop)) {
      let bad = false;
      const v = value.replace(/(-?)(\d*\.?\d+)px\b/g, (all, minus: string, num: string) => {
        const px = parseFloat(num);
        if (px === 0) return all;
        if (px < 2 || px > 32) {
          bad = true;
          return all;
        }
        const name = `var(--space-${nearest(px, SPACE)})`;
        return minus === "-" ? `calc(-1 * ${name})` : name;
      });
      if (bad) return leftover();
      return v === value ? keep() : set(v);
    }

    if (prop === "border-radius") {
      if (value === "0" || value.endsWith("%")) return keep();
      const rm = /^(\d*\.?\d+)(px|rem)$/.exec(value);
      if (rm === null) return value.includes("var(") ? keep() : leftover();
      const px = toPx(rm[1], rm[2]);
      if (px > 16 && px < 100) return leftover(); // 形が変わりうるので手で決める
      const name = px <= 4 ? "sm" : px <= 9 ? "md" : px <= 16 ? "lg" : "full";
      return set(`var(--radius-${name})`);
    }

    if (prop === "box-shadow") {
      if (value.includes("inset") || value === "none" || value.startsWith("var(")) return keep();
      const sm = /^-?\d+(?:px)?\s+-?\d+(?:px)?\s+(\d+)px\s+(?:\d+px\s+)?rgb\(0 0 0 \/ [\d.]+\)$/.exec(value);
      if (sm === null) return leftover();
      const blur = parseFloat(sm[1]);
      return set(`var(--shadow-${blur <= 4 ? "sm" : blur <= 16 ? "md" : "lg"})`);
    }

    if (/^(transition|animation)(-duration)?$/.test(prop)) {
      if (value.includes("infinite")) return keep();
      // カンマで分けた項目ごとに、1 つ目の時間だけを段階にする。delay（2 つ目の時間）や 500ms を超える時間は手で決める。50ms 未満があれば触らない
      const time = /(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g;
      const toMs = (num: string, unit: string) => (unit === "s" ? parseFloat(num) * 1000 : parseFloat(num));
      const items = splitTopLevel(value);
      for (const item of items) {
        const times = [...item.matchAll(time)];
        if (times.length > 1 || times.some((t) => toMs(t[1], t[2]) > 500)) return leftover();
        // 0 や極小の時間は、動きを止めるための指定（動きを減らす設定など）。段階にすると動き出す
        if (times.some((t) => toMs(t[1], t[2]) < 50)) return keep();
      }
      const v = items
        .map((item) => item.replace(time, (_all, num: string, unit: string) => `var(--duration-${nearest(toMs(num, unit), DURATION)})`))
        .join(", ");
      return v === value ? keep() : set(v);
    }

    return keep();
  });

  return { css: out.join("\n"), leftovers };
}

if (import.meta.main) {
  const file = process.argv[2];
  if (file === undefined) {
    console.error("使い方: node scripts/migrate-literals.ts <file.css>");
    process.exit(2);
  }
  const { css, leftovers } = migrate(readFileSync(file, "utf8"));
  writeFileSync(file, css);
  for (const l of leftovers) console.log(`${file}:${l.line}: ${l.text}`);
}
