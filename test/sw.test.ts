import { test } from "node:test";
import assert from "node:assert/strict";
import { setBadge } from "../src/badge.ts";
import { notificationPath, openOrFocus, type ClientLike } from "../src/sw.ts";

const isAppPath = (p: string) => p.startsWith("/") && !p.startsWith("//");

test("通知の data のパスは、アプリのパスならそれ、違えば /", () => {
  assert.equal(notificationPath({ path: "/day/2026-01-02" }, isAppPath), "/day/2026-01-02");
  assert.equal(notificationPath({ path: "//evil.example" }, isAppPath), "/");
  assert.equal(notificationPath(null, isAppPath), "/");
  assert.equal(notificationPath({ path: 1 }, isAppPath), "/");
});

function client(visible: boolean, log: string[], name: string, focusFails = false, focused = false): ClientLike {
  return {
    focused,
    visibilityState: visible ? "visible" : "hidden",
    postMessage: (m: unknown) => void log.push(`${name}:post:${JSON.stringify(m)}`),
    focus: async () => {
      log.push(`${name}:focus`);
      if (focusFails) throw new Error("no");
    },
  };
}

test("開いているウィンドウがあれば、見えているものに遷移を頼んでから前に出す", async () => {
  const log: string[] = [];
  const a = client(false, log, "a");
  const b = client(true, log, "b");
  await openOrFocus({ matchAll: async () => [a, b], openWindow: async () => void log.push("open") }, "/x");
  assert.deepEqual(log, ['b:post:{"type":"navigate","path":"/x"}', "b:focus"]);
});

test("どれも見えず前面でもなければ、先頭のウィンドウに頼む", async () => {
  const log: string[] = [];
  const a = client(false, log, "a");
  const b = client(false, log, "b");
  await openOrFocus({ matchAll: async () => [a, b], openWindow: async () => void log.push("open") }, "/x");
  assert.deepEqual(log, ['a:post:{"type":"navigate","path":"/x"}', "a:focus"]);
});

test("見えていなくても前面のウィンドウは、先にある見えないものより優先する", async () => {
  const log: string[] = [];
  const a = client(false, log, "a");
  const b = client(false, log, "b", false, true);
  await openOrFocus({ matchAll: async () => [a, b], openWindow: async () => void log.push("open") }, "/x");
  assert.deepEqual(log, ['b:post:{"type":"navigate","path":"/x"}', "b:focus"]);
});

test("前に出せなくても投げない（遷移の頼みは先に届いている）", async () => {
  const log: string[] = [];
  await openOrFocus({ matchAll: async () => [client(true, log, "a", true)], openWindow: async () => void log.push("open") }, "/x");
  assert.deepEqual(log, ['a:post:{"type":"navigate","path":"/x"}', "a:focus"]);
});

test("ウィンドウが無ければ開く", async () => {
  const log: string[] = [];
  await openOrFocus({ matchAll: async () => [], openWindow: async (p: string) => void log.push(`open:${p}`) }, "/x");
  assert.deepEqual(log, ["open:/x"]);
});

test("バッジは 0 より大きければ付け、0 なら消し、失敗も無い API も投げない", async () => {
  const log: string[] = [];
  await setBadge({ setAppBadge: async (n?: number) => void log.push(`set:${n}`), clearAppBadge: async () => void log.push("clear") }, 3);
  await setBadge({ setAppBadge: async (n?: number) => void log.push(`set:${n}`), clearAppBadge: async () => void log.push("clear") }, 0);
  await setBadge({ setAppBadge: async () => { throw new Error("denied"); } }, 1);
  await setBadge({}, 1);
  assert.deepEqual(log, ["set:3", "clear"]);
});
