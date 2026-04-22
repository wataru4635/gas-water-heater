# CLAUDE.md

本ファイルは Claude Code が本リポジトリで作業する際に必ず参照するルールです。内容は `.cursor/rules/*.mdc` と `CODING_RULES.md` を統合したものです。矛盾時は **既存コード → `CODING_RULES.md` → 本ファイル** の優先で解釈してください。

---

## 基本方針（プロジェクト全体ルール）

以下のルールを必ず守ること。

- 既存コードの書き方を最優先で踏襲する
- 新しい書き方を勝手に導入しない
- 不要な div を増やさない
- クラス名は意味が分かる英語にする
- **既存コードと違う書き方は禁止する**（スタイル・パターンの不一致を作らない）
- **実装前に既存パターンを確認する**（近いセクション・同名プレフィックスのファイルを読む）
- **不明な場合は推測せず既存に合わせる**

### プレフィックス

- `gas-water-heater` を使用する

### 命名

- BEM を使用する
- HTML と SCSS のクラスは完全一致させる

### ビルド

- `src/` を正とする
- `dist/` は直接編集しない
- **`gulp build` / `npx gulp build` 等のビルドコマンドは明示依頼がない限り実行しない**

### Figma（figma-developer-mcp）

- ユーザーが **`https://www.figma.com/design/...` の URL を貼っただけ**でよい。毎回「figma-developer-mcp を使って取得してください」と類題の長文を求めない。
- 実装・検証に必要なときは、貼られた URL から **`fileKey`**（`/design/` 直後の ID）と **`node-id`**（クエリの `node-id=2027-207` 等）を読み取り、**`node-id` の `-` を `:` に置き換えた `nodeId`** で **`mcp_figma-developer-mcp_get_figma_data`** を呼び出してフレームを取得する。

---

## 命名ルール（BEM・プレフィックス）

### BEM

- **block**: `.gas-water-heater-xxx`
- **element**: `__`
- **modifier**: `--`

### ルール

- HTML と SCSS は完全一致させる
- ページ識別子（`gas-water-heater`）をブロック名に含める

### 画像ファイル名（BEM とは別）

- ラスター・SVG の連番は **`_01` / `_02`**（例: `gas-water-heater-about-diagram_01.png`）。**`-01` は使わない**

### 例

```text
.gas-water-heater-fv
.gas-water-heater-fv__title
.gas-water-heater-fv__btn--primary
```

---

## HTML ルール（`src/**/*.html`）

### 構造

- `<main>` 内に `<section>` を並べる
- セクション単位で構成する
- `lang="ja"`、viewport、`format-detection`、`charset` を `<head>` に配置
- CSS: `./assets/css/style.css` / JS: `<script defer src="./assets/js/script.js"></script>`

### セクションの基本構造（必須パターン）

- **`<section>` には必ず `inner-overflow` クラスを付ける**（ブロック名と併記）
- **その直下のインナー `<div>` には必ず `inner` クラスを付ける**（`{block}__inner` と併記）
- この組み合わせによって、全幅背景 / 横スクロール制御（`inner-overflow`）と、コンテンツ幅・左右パディング（`inner`）を統一する

```html
<section class="gas-water-heater-recommended inner-overflow">
  <div class="gas-water-heater-recommended__inner inner">
    <!-- セクションの中身 -->
  </div>
</section>
```

### クラス

- SCSS と完全一致させる
- JS 用クラスは `js-` を使用する
- JS 用クラスにスタイルは当てない
- セクションのルート `class` は Sass のブロック名と同一（例: `class="gas-water-heater-fv"`）
- 見出しの共通見た目は `.section-title` を使用

### 画像（HTML）

- FV 以外は `loading="lazy"` を付与する
- CLS 対策のため `width` / `height` を可能な限り指定する
- **`img` の属性順**: `src` を先頭とし、続けて **`alt` → `width` → `height` → `loading="lazy"`**（付与する場合のみ）**→ `class`** の順にする（`loading` を付けないときは `height` の次に `class`）
- **`decoding="async"` は使用しない**（付けない）
- `alt` は装飾でなければ内容を具体的に

### picture

- `media` 属性は **`(max-width: 767px)`** を使用する
- `<picture>` + `<source media="(max-width: 767px)" type="image/webp">` と PC 用 `img` の組み合わせ

### リンク

- 外部サイトは `target="_blank"` と `rel="noopener noreferrer"` を付与

---

## SCSS ルール（`src/sass/**/*.scss`）

### エントリと読み込み

- エントリは `src/sass/style.scss` のみ
- `module` 構造で管理する
- 各ファイルの先頭で `@use "global" as *;`

### ファイル命名

- パーシャルは先頭にアンダースコア: `_gas-water-heater-fv.scss`
- ページ／案件用のブロックは HTML のルートクラスと一致させる
- 複数ページ共通部品はプレフィックスなしでもよい（例: `_inner.scss`, `_section-title.scss`）

### メディアクエリ

- `@media (max-width: 767px)` を使用する（767px 以下をスマホ想定）
- **ファイル末尾にまとめない**。必ず対象セレクタの**内側にネスト**する
- `@include mq()` は新規・追記では使わない
- 768px 以上にだけスタイルを当てたい場合は `@media (min-width: 768px)` を使用可

#### 正しい例

```scss
.block {
  font-size: 32px;

  @media (max-width: 767px) {
    font-size: 20px;
  }
}
```

#### NG 例

```scss
@media (max-width: 767px) {
  .block {
    font-size: 20px;
  }
}
```

### タイポグラフィ

- **`clamp()` は使用しない**
- フォントサイズは PC / SP で**固定値**に切り替える（ブレークポイント内で `font-size` を指定）
- 既存の `myClamp()` があっても新規・追記では Figma の PC / SP 指定に沿った段階的切り替えを優先

### デザイントークン

- 色・フォント・余白・アニメーション時間などは `src/sass/global/_setting.scss` の `:root` カスタムプロパティ（`--main-color` 等）を優先
- 数値ユーティリティは `src/sass/global/_function.scss`（`rem()`, `vw()` など）

### 余白・マージン

- マージンは **`margin-top` / `margin-left` を基本**とする
- **`margin-bottom` は原則使わない**（必要な場合は最小限にし、短いコメントで意図を残す）
- 左右または上下を対で同じ意図で指定する場合は `margin-inline` / `margin-block` を使う
- 親子の内側余白は `padding` で問題ない

### レイアウト用ユーティリティ

- コンテンツ幅: `.inner`（`max-width: var(--max-width)`、横パディングは `--padding-pc` / `--padding-sp`）
- 横スクロール・全幅背景のラッパー: `.inner-overflow`
- 表示切替: `.u-desktop` / `.u-mobile`

### リセットとの重複禁止

- **`src/sass/base/_reset.scss` にある指定**（`box-sizing`、`body`、`ul` / `ol` / `p` / 見出しのマージン・パディング消し、`a` / `img` / `span` の基礎など）は、**モジュール側で同じことを書かない**
- ブロックでは **その場のレイアウト・タイポだけ**を書く
- 迷ったら **`_reset.scss` にあるか確認**する

---

## 画像ルール（パス・形式・命名）

### パス

- ビルド後の参照は **`./assets/images/gas-water-heater/`**（HTML は `dist` 基準の相対パス）
- ソース画像は **`src/images/gas-water-heater/`** に置く

### 形式

- 写真・複雑なグラデ等は **WebP**（ビルドで生成する運用に合わせる）
- アイコンは **SVG** 可

### 命名

- ファイル名に **プレフィックス**（ページ識別子）を必ず付ける
- **連番（01, 02, …）は `_01` 形式**に統一する
- 単語の区切りはハイフン（ケバブケース）、**番号の直前だけアンダースコア**（`...-card_01`）
- **`-01` や `card01` は使わない**

### 例

```text
gas-water-heater-recommended-card_01.webp
gas-water-heater-construction-card_02.webp
```

---

## JavaScript ルール（`src/js/**/*.js`）

### 基本

- DOM 操作は **`js-` クラス**で行う
- クラスで対象を限定する
- エントリは `src/js/script.js`（ビルド後 `dist/assets/js/script.js`）

### 設計

- グローバル汚染しない
- 必要に応じて関数化する
- 既存パターン: `observeElements(selector, activeClass)` / `wrapTextInSpans(selector)` 等

### 禁止

- **ID 依存の実装を避ける**（保守性・複数インスタンスの観点）

---

## ディレクトリとビルドの前提

| 種別 | ソース | 出力（`dist`） |
|------|--------|----------------|
| SCSS | `src/sass/**` | `dist/assets/css/style.css` |
| HTML | `src/**/*.html` | `dist/` |
| JS | `src/js/**` | `dist/assets/js/` |
| 画像 | `src/images/**` | `dist/assets/images/` |

- Gulp（`_gulp/`）で Sass コンパイル、PostCSS、画像コピー・WebP 変換を実行
- HTML からは `./assets/css/style.css` と `./assets/js/script.js` を参照（`dist` 基準の相対パス）

---

## フォーマット

- ルートの `.jsbeautifyrc` に準拠: HTML / CSS / JS は **インデント 2 スペース**

---

## `gas-water-heater-repair` → `gas-water-heater` 対応表

| 種別 | 旧（例） | 新（例） |
|------|-----------|-----------|
| 画像フォルダ | `src/images/gas-water-heater-repair/` | `src/images/gas-water-heater/` |
| SCSS ファイル | `_gas-water-heater-repair-fv.scss` | `_gas-water-heater-fv.scss` |
| ブロック class | `.gas-water-heater-repair-fv` | `.gas-water-heater-fv` |
| img パス | `.../gas-water-heater-repair/...` | `.../gas-water-heater/...` |

リネーム時は **HTML・SCSS・画像パスを同時に**置換する。

---

## 参照

- 詳細・例外・表形式の一覧はリポジトリ直下の **`CODING_RULES.md`**（人が読む完全版）
- AI 向けの短縮版は **`.cursor/rules/*.mdc`**
- 実装と矛盾した場合は **実コードまたはチーム合意**を優先し、本書を更新する
