# ui

個人用の PWA 群（Preact + Vite）で共有する、デザイントークン・基本コンポーネント・PWA の共通処理。

決まりは [DESIGN.md](DESIGN.md)。

## 配り方

- アプリは git の依存として読む: `"ui": "github:za29ra/ui#v<版>"`。
- **タグには、ビルドした `dist/`（`.js` と `.d.ts`）をコミットする。** Node は `node_modules` の中の `.ts` の型を除去しない（`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`）ので、アプリの `node --test` が読めない。pnpm は依存の build スクリプトを既定で走らせないので、`prepare` には頼らない。
- `package.json` の `exports` で、JS のモジュール（`ui/contrast`・`ui/css-themes`）と CSS（`ui/tokens.css`・`ui/base.css`）・`ui/DESIGN.md` を出す。部品を足したら（3b 以降）、`ui/components.css` と部品のモジュールもここに足す。
- `package.json` の `files` に `dist`・CSS・`DESIGN.md` を入れる（pnpm は git の依存を pack してから入れるので、`files` が無いと `.gitignore` に入れたものが落ちる）。
- 部品（Preact）を足すときは、`preact` を `peerDependencies` にする（`dependencies` にすると Preact が 2 つ読まれ、フックが壊れる）。今はまだ部品が無いので、依存は無い。
- 値の検査（`bin/check-tokens.js`、DESIGN.md 5.1）は、まだ無い。作ったら、アプリのテストから呼ぶ（呼び方は実装のときに書く）。

## 版

- `v<major>.<minor>.<patch>`。トークン・部品の名前を変える・消すのは major。足すのは minor。
- 名前を変えるときは、旧い名前を別名（`--old: var(--new)`）として残し、次の major で消す。

## 手元で `ui` とアプリを一緒に変える

作業の worktree（`<作業>/ui` と `<作業>/<アプリ>`）が兄弟に並んでいるとき:

1. `src/` を変えるときは、`ui` で `pnpm build --watch` を動かす（`dist/` を作り続ける）。CSS だけなら要らない。
2. アプリの側で一時的に `pnpm add ui@link:../ui` で繋ぐ。`ui` のファイルが `../ui/node_modules/preact` を読まないよう、アプリの Vite の設定に `resolve.dedupe: ["preact"]` を入れておく。
3. コミットする前に、アプリの依存をタグの指定へ戻す。

## pnpm の `minimumReleaseAge`

git の依存にはかからない。作ったばかりのタグでも `pnpm add ui@github:za29ra/ui#v<版>` で入る（pnpm 12.14 で確かめた）。lockfile には、タグが指すコミットの tarball の URL と integrity が入る。
