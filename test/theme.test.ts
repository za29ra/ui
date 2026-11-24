import { test } from "node:test";
import assert from "node:assert/strict";
import type { StorageLike } from "../src/storage.ts";
import { DARK_THEMES, DEFAULT_THEME_PREFS, LIGHT_THEMES, MODES, loadThemePrefs, resolveTheme, saveThemePrefs, themeBootScript, themeKey } from "../src/theme.ts";

const THEME_KEY = themeKey("demo");

function memory(init: Record<string, string> = {}) {
  const data = { ...init };
  const storage: StorageLike = {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
  return { data, storage };
}

const throwing = (): StorageLike => {
  throw new Error("SecurityError");
};

test("テーマのキーは <アプリ名>.theme", () => {
  assert.equal(THEME_KEY, "demo.theme");
});

test("テーマの一覧（先頭が現行のテーマ）", () => {
  assert.deepEqual(LIGHT_THEMES.map((t) => t.id), ["default-light", "latte"]);
  assert.deepEqual(DARK_THEMES.map((t) => t.id), ["default-dark", "frappe", "macchiato", "mocha"]);
});

test("自動は OS の外観で、選んだライトかダークのテーマにする", () => {
  const prefs = { mode: "auto", light: "latte", dark: "mocha" } as const;
  assert.deepEqual(resolveTheme(prefs, false), { id: "latte", scheme: "light" });
  assert.deepEqual(resolveTheme(prefs, true), { id: "mocha", scheme: "dark" });
});

test("ライト・ダークに固定したら OS の外観によらない", () => {
  for (const systemDark of [false, true]) {
    assert.deepEqual(resolveTheme({ mode: "light", light: "latte", dark: "frappe" }, systemDark), { id: "latte", scheme: "light" });
    assert.deepEqual(resolveTheme({ mode: "dark", light: "latte", dark: "frappe" }, systemDark), { id: "frappe", scheme: "dark" });
  }
});

test("何も保存していなければ、自動・現行のライト・現行のダーク", () => {
  assert.deepEqual(DEFAULT_THEME_PREFS, { mode: "auto", light: "default-light", dark: "default-dark" });
  assert.deepEqual(loadThemePrefs("demo", () => memory().storage), DEFAULT_THEME_PREFS);
});

test("保存した設定を読む", () => {
  const m = memory();
  saveThemePrefs("demo", () => m.storage, { mode: "dark", light: "latte", dark: "macchiato" });
  assert.equal(m.data[THEME_KEY], '{"mode":"dark","light":"latte","dark":"macchiato"}');
  assert.deepEqual(loadThemePrefs("demo", () => m.storage), { mode: "dark", light: "latte", dark: "macchiato" });
});

test("壊れた値・知らない id・足りない項目は、その項目だけ既定にする", () => {
  const load = (raw: string) => loadThemePrefs("demo", () => memory({ [THEME_KEY]: raw }).storage);
  assert.deepEqual(load("{"), DEFAULT_THEME_PREFS);
  assert.deepEqual(load("null"), DEFAULT_THEME_PREFS);
  assert.deepEqual(load("[]"), DEFAULT_THEME_PREFS);
  assert.deepEqual(load('{"mode":"sepia","light":"mocha","dark":"latte"}'), DEFAULT_THEME_PREFS);
  assert.deepEqual(load('{"dark":"mocha"}'), { mode: "auto", light: "default-light", dark: "mocha" });
  // プロトタイプの名前は id ではない
  assert.deepEqual(load('{"mode":"toString","light":"constructor"}'), DEFAULT_THEME_PREFS);
});

test("storage が例外を出しても既定で動き、保存は黙って諦める", () => {
  assert.deepEqual(loadThemePrefs("demo", throwing), DEFAULT_THEME_PREFS);
  assert.doesNotThrow(() => saveThemePrefs("demo", throwing, DEFAULT_THEME_PREFS));
});

test("アプリ名が不正なら、読み書きとも投げる（storage の例外と違い、黙って既定にしない）", () => {
  assert.throws(() => loadThemePrefs("Bad", throwing));
  assert.throws(() => saveThemePrefs("Bad", throwing, DEFAULT_THEME_PREFS));
});

/** スクリプトを偽の localStorage・matchMedia・document で動かし、付けた data-theme を返す */
function runBoot(app: string, stored: string | null, systemDark: boolean): string | undefined {
  const dataset: Record<string, string> = {};
  const env = {
    localStorage: { getItem: (k: string) => (k === `${app}.theme` ? stored : null) },
    matchMedia: (q: string) => ({ matches: q === "(prefers-color-scheme: dark)" && systemDark }),
    document: { documentElement: { dataset } },
  };
  new Function("localStorage", "matchMedia", "document", themeBootScript(app))(env.localStorage, env.matchMedia, env.document);
  return dataset.theme;
}

test("初期化のスクリプトは、すべての設定の組で resolveTheme と同じテーマを付ける", () => {
  const storage = (v: string | null) => () => ({ getItem: () => v, setItem: () => {} });
  const values: Array<string | null> = [null, "{", "null", "[]", '{"mode":"bogus"}', '{"light":"bogus","dark":"bogus"}', '{"mode":"toString","light":"constructor"}'];
  for (const m of MODES) for (const l of LIGHT_THEMES) for (const d of DARK_THEMES) values.push(JSON.stringify({ mode: m.id, light: l.id, dark: d.id }));
  for (const v of values) {
    for (const systemDark of [false, true]) {
      const expected = resolveTheme(loadThemePrefs("demo", storage(v)), systemDark).id;
      assert.equal(runBoot("demo", v, systemDark), expected, `${v} / systemDark=${systemDark}`);
    }
  }
});

test("初期化のスクリプトは localStorage が投げても既定のテーマを付ける", () => {
  const dataset: Record<string, string> = {};
  const throwing = { getItem: () => { throw new Error("denied"); } };
  new Function("localStorage", "matchMedia", "document", themeBootScript("demo"))(throwing, () => ({ matches: false }), { documentElement: { dataset } });
  assert.equal(dataset.theme, "default-light");
});

test("初期化のスクリプトはアプリ名を JSON の文字列として埋め込む", () => {
  assert.match(themeBootScript("demo"), /"demo\.theme"/);
});
