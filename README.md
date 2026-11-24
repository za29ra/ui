# ui

個人用の PWA 群（Preact + Vite）で共有する、デザイントークン・基本コンポーネント・PWA の共通処理。

決まりは [DESIGN.md](DESIGN.md)。

## 配り方

- アプリは git の依存として読む: `"ui": "github:za29ra/ui#v<版>"`。
- **タグには、ビルドした `dist/`（`.js` と `.d.ts`）をコミットする。** Node は `node_modules` の中の `.ts` の型を除去しない（`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`）ので、アプリの `node --test` が読めない。pnpm は依存の build スクリプトを既定で走らせないので、`prepare` には頼らない。
- `package.json` の `exports` で、JS のモジュール（`ui/contrast`・`ui/css-themes`、共通のロジック `ui/theme`・`ui/push`・`ui/pull-refresh` など。一覧は DESIGN.md 2.6）と CSS（`ui/tokens.css`・`ui/base.css`・`ui/components.css`）・`ui/DESIGN.md` を出す。モジュールを足したら、ここにも足す。
- `package.json` の `files` に `dist`・CSS・`DESIGN.md` を入れる（pnpm は git の依存を pack してから入れるので、`files` が無いと `.gitignore` に入れたものが落ちる）。
- `preact` は `peerDependencies`（`>=11`）にしている（`dependencies` にすると Preact が 2 つ読まれ、フックが壊れる）。フック（`ui/use-theme`・`ui/use-push` など）と PullRefresh が `preact/hooks` を読むので、アプリは自分の依存に `preact` を入れておく。
- 値の検査（`bin/check-tokens.js`、DESIGN.md 5.1）は、まだ無い。作ったら、アプリのテストから呼ぶ（呼び方は実装のときに書く）。

## 版

- `v<major>.<minor>.<patch>`。トークン・部品の名前を変える・消すのは major。足すのは minor。
- 名前を変えるときは、旧い名前を別名（`--old: var(--new)`）として残し、次の major で消す。
- v0.3.0: 共通のロジック（DESIGN.md 2.6）と PullRefresh（`ui/pull-refresh`、見た目は `.ui-pull`）。
- v0.4.0: シート・ダイアログ・確認・トースト・Popup・設定の部品。
- v0.5.0: アイコンの土台とメニュー（`.ui-ico`・`ui-ico-*`、`ui/menu`・`ui/menu-rules`）。破壊的な変更: `ui/close-icon` と、部品のアイコンの props（`SheetClose` の `icon`・`SheetFrame` の `closeIcon`・`ThemeSettings` の `checkIcon`・`NotifySettings` の `icons`）を消した。部品は `ui-ico-*` を描く。

## 手元で `ui` とアプリを一緒に変える

作業の worktree（`<作業>/ui` と `<作業>/<アプリ>`）が兄弟に並んでいるとき:

1. `src/` を変えるときは、`ui` で `pnpm build --watch` を動かす（`dist/` を作り続ける）。CSS だけなら要らない。
2. アプリの側で一時的に `pnpm add ui@link:../ui` で繋ぐ。`ui` のファイルが `../ui/node_modules/preact` を読まないよう、アプリの Vite の設定に `resolve.dedupe: ["preact"]` を入れておく。
3. コミットする前に、アプリの依存をタグの指定へ戻す。

## pnpm の `minimumReleaseAge`

git の依存にはかからない。作ったばかりのタグでも `pnpm add ui@github:za29ra/ui#v<版>` で入る（pnpm 12.14 で確かめた）。lockfile には、タグが指すコミットの tarball の URL と integrity が入る。

## 部品の見本

`pnpm gallery` で `http://127.0.0.1:5190/gallery/` に全部の部品を並べる（`gallery/` は配らない）。`?theme=<data-theme>` でテーマを、`?sheet` でシートを開いた状態を、`?menu` でメニューを開いた状態を、`?dialogs` でダイアログの形を選ぶ。部品を足す・変えるときは、見本も足す・直す。
