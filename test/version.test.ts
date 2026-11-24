import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIdOf, hasNewVersion, VERSION_PATH } from "../src/version.ts";

test("version.json の buildId は空でない文字列のときだけ受ける", () => {
  assert.equal(buildIdOf({ buildId: "abc" }), "abc");
  for (const data of [{ buildId: "" }, { buildId: 1 }, {}, null, "abc", undefined]) {
    assert.equal(buildIdOf(data), null, JSON.stringify(data));
  }
});

test("配信中の版が今の版と違うときだけ true。キャッシュを使わずに取る", async () => {
  const calls: Array<[string, RequestInit]> = [];
  const serve = (body: unknown) => async (url: string, init: RequestInit) => {
    calls.push([url, init]);
    return Response.json(body);
  };
  assert.equal(await hasNewVersion(serve({ buildId: "b" }), "a"), true);
  assert.equal(await hasNewVersion(serve({ buildId: "a" }), "a"), false);
  assert.deepEqual(calls[0], [VERSION_PATH, { cache: "no-store" }]);
});

test("取れないときは新しい版があるとみなさない", async () => {
  // オフライン・ログイン画面に回された（CORS で失敗）
  assert.equal(await hasNewVersion(() => Promise.reject(new TypeError("Failed to fetch")), "a"), false);
  // version.json がない（SPA の index.html が返る）
  assert.equal(await hasNewVersion(async () => new Response("<!doctype html>", { headers: { "content-type": "text/html" } }), "a"), false);
  assert.equal(await hasNewVersion(async () => new Response("", { status: 500 }), "a"), false);
  assert.equal(await hasNewVersion(async () => Response.json({}), "a"), false);
});
