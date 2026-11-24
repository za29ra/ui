import { test } from "node:test";
import assert from "node:assert/strict";
import { b64urlDecode, b64urlEncode, pushStatus, sameKey, subscribeRequest } from "../src/push.ts";

const base = { supported: true, ios: true, standalone: true, permission: "default" as const, subscribed: false };

test("対応していない: iOS の Safari（ホーム画面に追加していない）は案内、それ以外は非対応", () => {
  assert.equal(pushStatus({ ...base, supported: false, standalone: false }), "needs-install");
  assert.equal(pushStatus({ ...base, supported: false, ios: false, standalone: false }), "unsupported");
  // ホーム画面から開いているのに使えない iOS（16.4 より前）は非対応
  assert.equal(pushStatus({ ...base, supported: false }), "unsupported");
});

test("拒否されている・購読していない・購読している", () => {
  assert.equal(pushStatus({ ...base, permission: "denied" }), "denied");
  assert.equal(pushStatus(base), "off");
  assert.equal(pushStatus({ ...base, permission: "granted" }), "off");
  assert.equal(pushStatus({ ...base, permission: "granted", subscribed: true }), "on");
  // 権限を取り消されたあとに購読が残っていても、on にしない
  assert.equal(pushStatus({ ...base, permission: "default", subscribed: true }), "off");
});

test("subscribeRequest は購読の鍵を base64url にする。鍵が取り出せなければ投げる", () => {
  const sub = {
    endpoint: "https://push.example/x",
    getKey: (name: "p256dh" | "auth") => (name === "p256dh" ? new Uint8Array([251, 255, 254]).buffer : new Uint8Array([1, 2, 3]).buffer),
  };
  assert.deepEqual(subscribeRequest(sub), { endpoint: sub.endpoint, keys: { p256dh: "-__-", auth: "AQID" } });
  assert.throws(() => subscribeRequest({ endpoint: "x", getKey: () => null }), /鍵/);
});

test("sameKey は、購読の公開鍵と今の鍵のバイト列が等しいかを見る。読めなければ同じとみなす", () => {
  const key = new Uint8Array([4, 1, 2, 3]);
  assert.equal(sameKey(new Uint8Array([4, 1, 2, 3]).buffer, key), true);
  assert.equal(sameKey(new Uint8Array([4, 1, 2, 9]).buffer, key), false);
  assert.equal(sameKey(new Uint8Array([4, 1, 2]).buffer, key), false);
  assert.equal(sameKey(new Uint8Array([4, 1, 2, 3, 0]).buffer, key), false);
  // ArrayBufferView（オフセット付き）でも
  assert.equal(sameKey(new Uint8Array([0, 4, 1, 2, 3, 0]).subarray(1, 5), key), true);
  assert.equal(sameKey(null, key), true);
  assert.equal(sameKey(undefined, key), true);
});

test("base64url はパディングなしで往復する", () => {
  for (const bytes of [[], [0], [0xff, 0xfe], [1, 2, 3, 4, 5]]) {
    const u = new Uint8Array(bytes);
    const s = b64urlEncode(u);
    assert.doesNotMatch(s, /[=+/]/);
    assert.deepEqual([...b64urlDecode(s)], bytes);
  }
});
