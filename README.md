# ui

個人用の PWA 群（Preact + Vite）で共有する、デザイントークン・基本コンポーネント・PWA の共通処理。

決まりは [DESIGN.md](DESIGN.md)。

## 配り方

- アプリは git の依存として読む: `"ui": "github:za29ra/ui#v<版>"`。
- **タグには、ビルドした `dist/`（`.js` と `.d.ts`）をコミットする。** Node は `node_modules` の中の `.ts` の型を除去しない（`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`）ので、アプリの `node --test` が読めない。pnpm は依存の build スクリプトを既定で走らせないので、`prepare` には頼らない。
- `package.json` の `exports` で、JS のモジュールと CSS（`ui/tokens.css`・`ui/base.css`・`ui/components.css`）・`ui/DESIGN.md` を出す。
- `package.json` の `files` に `dist`・CSS・`DESIGN.md` を入れる（pnpm は git の依存を pack してから入れるので、`files` が無いと `.gitignore` に入れたものが落ちる）。
- `preact` は `peerDependencies` にする（`dependencies` にすると Preact が 2 つ読まれ、フックが壊れる）。
- 値の検査は `bin/check-tokens.js`。アプリのテストから呼ぶ（呼び方は実装のときに書く）。

## 版

- `v<major>.<minor>.<patch>`。トークン・部品の名前を変える・消すのは major。足すのは minor。
- 名前を変えるときは、旧い名前を別名（`--old: var(--new)`）として残し、次の major で消す。

## 手元で `ui` とアプリを一緒に変える

作業の worktree（`<作業>/ui` と `<作業>/<アプリ>`）が兄弟に並んでいるとき:

1. `ui` でビルドを watch で動かす（`dist/` を作り続ける）。
2. アプリの側で一時的に `pnpm add ui@link:../ui` で繋ぐ。`ui` のファイルが `../ui/node_modules/preact` を読まないよう、アプリの Vite の設定に `resolve.dedupe: ["preact"]` を入れておく。
3. コミットする前に、アプリの依存をタグの指定へ戻す。

## 要確認

- `pnpm-workspace.yaml` の `minimumReleaseAge` が git の依存にかからないか（最初に読み込むときに確かめる）。
