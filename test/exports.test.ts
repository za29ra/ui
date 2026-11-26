import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { exports: Record<string, string | { types: string; default: string }> };

/** 3c で足すロジックのモジュール（DESIGN.md 2.6）と PullRefresh、3c-2 で足す部品、3c-3 で足すメニュー、3d-4 で足す Field・Banner */
const MODULES = ["storage", "pwa", "dialog-layout", "theme", "use-theme", "push", "use-push", "toast", "version", "update-check", "sw-message", "register-sw", "badge", "sw", "auth", "pull", "pull-refresh", "modal-rules", "popup-rules", "popup", "modal", "sheet-frame", "confirm", "toast-state", "settings-text", "settings", "menu-rules", "menu", "field", "banner"];

for (const name of MODULES) {
  test(`ui/${name} を exports に出し、dist に .js と .d.ts がある`, () => {
    const e = pkg.exports[`./${name}`];
    assert.deepEqual(e, { types: `./dist/${name}.d.ts`, default: `./dist/${name}.js` });
    assert.ok(existsSync(new URL(`../dist/${name}.js`, import.meta.url)), `dist/${name}.js`);
    assert.ok(existsSync(new URL(`../dist/${name}.d.ts`, import.meta.url)), `dist/${name}.d.ts`);
  });
}

test("ui/sw は DOM と Preact を読まない（Service Worker の iife に入るため）", () => {
  const src = readFileSync(new URL("../src/sw.ts", import.meta.url), "utf8") + readFileSync(new URL("../src/badge.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /from "preact|document\.|window\./);
});
