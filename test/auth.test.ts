import { test } from "node:test";
import assert from "node:assert/strict";
import { authExpired, reloadOnce, RELOAD_INTERVAL_MS } from "../src/auth.ts";
import type { StorageLike } from "../src/storage.ts";

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

test("reloadOnce は 1 分に 1 回だけ読み込み直す", () => {
  const s = memory();
  let reloads = 0;
  const reload = () => void reloads++;
  assert.equal(reloadOnce("demo", () => s, 1000, reload), true);
  assert.equal(s.data.get("demo.reloadedAt"), "1000");
  assert.equal(reloadOnce("demo", () => s, 1000 + RELOAD_INTERVAL_MS - 1, reload), false);
  assert.equal(reloadOnce("demo", () => s, 1000 + RELOAD_INTERVAL_MS, reload), true);
  assert.equal(reloads, 2);
});

test("reloadOnce は記録できなければ読み込み直さない（繰り返しを止められないため）", () => {
  let reloads = 0;
  const broken = () => {
    throw new Error("storage が使えない");
  };
  assert.equal(reloadOnce("demo", broken, 0, () => void reloads++), false);
  assert.equal(reloads, 0);
});

const head = (type: string, status: number, contentType: string | null) => ({ type, status, headers: { get: (n: string) => (n === "content-type" ? contentType : null) } });

test("ログイン切れは、転送（opaqueredirect）・401・5xx でない HTML", () => {
  assert.equal(authExpired(head("opaqueredirect", 0, null)), true);
  assert.equal(authExpired(head("basic", 401, "application/json")), true);
  assert.equal(authExpired(head("basic", 200, "text/html")), true);
  assert.equal(authExpired(head("basic", 200, "application/json; charset=utf-8")), false);
  assert.equal(authExpired(head("basic", 404, "application/json")), false);
  assert.equal(authExpired(head("basic", 502, "text/html")), false);
});
