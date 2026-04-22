# コーディングルール（参考）

## Cursor との役割分担

| 用途 | 置き場所 |
|------|----------|
| **AI（Cursor）が毎回守る短い必須ルール** | **`.cursor/rules/*.mdc`**（[Cursor Project rules](https://docs.cursor.com/context/rules)。パスで絞り、リポジトリにコミットする） |
| **人が読む完全版・詳細・例外** | **本 `CODING_RULES.md`**（情報量が多いため、エディタに全文を毎回載せるより参照用に残す） |

実装やレビューでは、**`.cursor/rules` の要約**と**本書の詳細**を併用してください。矛盾時は **既存コード**を最優先し、次に本書を更新するかチームで合意します。

---

本ドキュメントは、本リポジトリの `src/sass` 配下および関連する HTML・画像・JavaScript の実装パターンを整理した**参考用**のガイドです。  
既存コードではプレフィックス `gas-water-heater-repair` が使われていますが、**新規ページや別案件では `gas-water-heater` に読み替える**想定で記載します（ディレクトリ名・クラス名・画像パスを一括で揃える）。

---

## 1. ディレクトリとビルドの前提

| 種別 | ソース | 出力（`dist`） |
|------|--------|----------------|
| SCSS | `src/sass/**` | `dist/assets/css/style.css` |
| HTML | `src/**/*.html` | `dist/` |
| JS | `src/js/**` | `dist/assets/js/` |
| 画像 | `src/images/**` | `dist/assets/images/` |

- Gulp（`_gulp/`）で Sass コンパイル、PostCSS（Autoprefixer、宣言のアルファベット順ソート等）、画像コピー・WebP 変換などを実行する構成です。
- HTML からは `./assets/css/style.css` と `./assets/js/script.js` を参照します（`dist` 基準の相対パス）。
- **ビルドの実行**: 作業・レビュー時は **`gulp build` / `npx gulp build` 等は実行しなくてよい**前提とします。ソースは `src/` を正とし、ビルドが必要なときは担当者がローカルで `_gulp/` から実行します。AI や自動化で検証するときも、**明示的に依頼がない限りビルドコマンドは走らせない**でください。

---

## 2. Sass（SCSS）のルール

### 2.1 エントリと読み込み

- エントリは `src/sass/style.scss` のみとし、次のようにまとめて読み込みます。

```scss
@use "./base/**";
@use "./module/**/*";
```

- **ベース**: `src/sass/base/`（リセット・全体の土台）
- **モジュール**: `src/sass/module/`（セクション・コンポーネント単位のパーシャル）

### 2.2 ファイル命名

- パーシャルは先頭にアンダースコア: `_gas-water-heater-fv.scss` など。
- **ページ／案件用のブロック**は、HTML のルートクラスと一致させる:  
  `_gas-water-heater-fv.scss` → ブロック `.gas-water-heater-fv`
- 複数ページで共通の部品はプレフィックスなしでもよい: `_inner.scss`, `_section-title.scss`

### 2.3 モジュールファイルの先頭

各 `module` パーシャルの先頭でグローバル設定を読み込みます。

```scss
@use "global" as *;
```

`global` は `src/sass/global/_index.scss` 経由で `function`・`setting`・`breakpoints` がまとまっています。

### 2.4 命名（BEM）

- **ブロック**: ページ識別子を含める（例: `.gas-water-heater-search`）
- **エレメント**: `__` でつなぐ（例: `.gas-water-heater-search__inner`）
- **モディファイア**: `--` でつなぐ（例: `.gas-water-heater-links__btn--estimate`）

HTML の `class` と SCSS のセレクタを**必ず対応**させます。

### 2.5 デザイントークン（変数・カスタムプロパティ）

- 色・フォント・余白・アニメーション時間などは `src/sass/global/_setting.scss` の `:root` カスタムプロパティ（`--main-color` 等）を優先して使います。
- 数値ユーティリティは `src/sass/global/_function.scss` の関数を利用できます（例: `rem()`, `vw()`, `myClamp()`）。

### 2.6 余白・マージン（方向の統一）

- **見た目上の要素間の余白をマージンで取る場合は、原則 `margin-top` と `margin-left` で統一してください。**（下・右に積み上がないようにし、隣接マージンの相殺や方向のばらつきを避けるため）
- **左右または上下を対で同じ意図で指定する場合は、`margin-inline` や `margin-block` を使ってください。**（例: 横方向まとめて `margin-inline: auto`、縦方向まとめて `margin-block: 1rem`）。
- 親子の内側余白は `padding` で問題ありません（必要に応じて `padding-top` / `padding-left` に揃える運用でもよい）。
- レイアウト都合で `margin-bottom` / `margin-right` を使うほうが明らかに簡潔な場合のみ例外とし、そのときもブロック内で方針が分かるようコメントを残すとよい。

### 2.7 メディアクエリ（ブレークポイント）

- **メディアクエリの記述は、基本的に `@media (max-width: 767px)` を使います。**（767px 以下をスマートフォン向けとする想定）
- **SCSS では、ファイル末尾にまとめて `@media` ブロックを置くのではなく、該当するセレクタ（クラス）の内側にネストして書く**運用とします。`_gas-water-heater-about.scss` の `.gas-water-heater-about__heading-en` などと同様です。
- 768px 以上にだけスタイルを当てたい場合は、`@media (min-width: 768px)` を使って構いません（全幅背景や `min-width: 1100px` など既存パターンに合わせる用途）。
- **`@include mq()` は新規・追記では使わない**でください。`_breakpoints.scss` の `mq` は、`.u-desktop` / `.u-mobile` などユーティリティ用に読み込まれるだけです。
- HTML の `<picture>` の `media` 属性も、本プロジェクトでは `(max-width: 767px)` と揃えます（既存の `index.html` と一致）。

### 2.8 タイポグラフィと `clamp()`

- **フォントサイズのレスポンシブ対応は、`clamp()` ではなくブレークポイントごとの固定値**（例: `@media (max-width: 767px)` 内で `font-size` を切り替え）で行ってください。既存の `myClamp()` 等のグローバル関数があっても、新規・追記では **Figma の PC / SP 指定に沿った段階的な切り替え**を優先します。
- 例外が必要な場合はチーム合意のうえ、該当ブロックに理由をコメントで残すとよいです。

### 2.9 レイアウト用ユーティリティ

- コンテンツ幅: `.inner`（`max-width: var(--max-width)`、横パディングは `--padding-pc` / `--padding-sp`）
- 横スクロールや全幅背景で `overflow` を切るラッパー: `.inner-overflow`
- 表示切替: `.u-desktop` / `.u-mobile`（`_breakpoints.scss` 内で定義）

### 2.10 リセット（`_reset.scss`）との重複禁止

`src/sass/base/_reset.scss` に既に**グローバルな初期化**が入っているため、**モジュール（`module/`）やその他のパーシャルで同じ指定を繰り返し書かない**でください。

- **すでにリセットされている例**（重複を書かない）:  
  全要素の `box-sizing`、`html` / `body` の基礎指定、`ul` / `ol` の `margin` / `padding` / `list-style`、`h1`〜`h4` / `p` / `figure` / `blockquote` / `dl` / `dd` 等の `margin` / `padding`、`a` の `display` / `text-decoration` / `color`、`img` の `display: block`、`span` の `display: inline-block` など（**実際の定義は必ず `_reset.scss` を参照**すること）。
- **書いてよい例**: その**コンポーネントだけ**必要な `margin-top` や `font-size`、意図的な上書き（デザイン上、リセットと異なる見た目にしたいとき）。
- 迷ったときは **`_reset.scss` にあるか確認**し、なければリセットへの追加を検討するか、ブロック内の最小限の上書きにとどめる。

---

## 3. HTML のルール

### 3.1 基本構造

- `lang="ja"`、viewport、`format-detection`、`charset` を `<head>` に配置。
- 本番公開時は `robots` や OGP を案件に合わせて更新する。
- CSS: `./assets/css/style.css`  
- JS: `<script defer src="./assets/js/script.js"></script>`

### 3.2 セマンティクスとクラス

- ランディングの主ブロックは `<main>` 直下に `<section>` を並べる。
- **セクションのルート `class`** は Sass のブロック名と同一にする（例: `class="gas-water-heater-fv"`）。
- 見出しの共通見た目は `.section-title` を使い、強調語は `.text-blue` など既存ユーティリティに合わせる。

#### セクションの基本構造（必須パターン）

- **`<section>` には必ず `inner-overflow` クラスを併記する**（全幅背景・横スクロール制御のラッパー）
- **直下のインナー `<div>` には必ず `inner` クラスを併記する**（`{block}__inner` と合わせてコンテンツ幅・左右パディングを付与）
- この 2 段構造を全セクションで統一する。

```html
<section class="gas-water-heater-recommended inner-overflow">
  <div class="gas-water-heater-recommended__inner inner">
    <!-- セクション内容 -->
  </div>
</section>
```

### 3.3 画像

- パス例: `./assets/images/gas-water-heater/gas-water-heater-fv.webp`  
  （フォルダ名＝ページ識別子、ファイル名も識別子をプレフィックスにすると検索しやすい）
- **同一ブロック内で連番の画像**（カード 1・2・3 など）を並べるときは、ファイル名の番号は **`_01` / `_02` / …** とする（`-01` や `01` 直結は使わない）。HTML の `src` もその名前に合わせる。詳細は **第4章** と `02-image-export/WORKFLOW_02_IMAGE_RENAMING.md`。
- **FV 以外**の画像には `loading="lazy"` を付与する運用が見られます。
- **レスポンシブ**は `<picture>` + `<source media="(max-width: 767px)" type="image/webp">` と PC 用 `img` の組み合わせ。
- **CLS 対策**のため `width` / `height` を可能な限り指定する。
- `alt` は装飾でなければ内容を具体的に。
- **`img` の属性順（推奨）**: **`src` を先頭**とし、続けて **`alt` → `width` → `height` → `loading="lazy"`**（FV 以外など付与する場合のみ）**→ `class`** の順に書く。装飾などで `loading` を付けない場合は `height` の直後に `class` とする。
- `img` には **`decoding="async"` を原則付けない**（必要がなければ省略する）。

### 3.4 リンク

- 外部サイトは `target="_blank"` と `rel="noopener noreferrer"` を付与。

### 3.5 JavaScript 連携用クラス

- 動作専用のクラスは **`js-` プレフィックス**（例: `js-fade-in`, `js-text-split`）。スタイルは原則付けない。

---

## 4. 画像ファイル・フォルダのルール

- ソースは **`src/images/gas-water-heater/`** のように、HTML／SCSS のブロック名と対応するフォルダにまとめる。
- 形式: 写真・複雑なグラデーションは **WebP**（ビルドで生成する運用に合わせる）。アイコンは **SVG** も可。
- 命名は「**ページ識別子 + ブロックや用途**」が分かるようにする（例: `gas-water-heater-search-banner-sp.webp`）。
- **連番（01, 02, …）を付けるときは、番号の直前の区切りをアンダースコア（`_`）にする。** 単語どうしの区切りはケバブケースのハイフンのままとする。  
  - 正: `gas-water-heater-recommended-card_01.webp`、`gas-water-heater-construction-card_02.webp`  
  - 誤: `...-card-01.webp`、`...-card01.webp`（ハイフン＋番号や番号の直結は使わない）
- 詳細なリネーム手順は `02-image-export/WORKFLOW_02_IMAGE_RENAMING.md` を参照（**本書と同一の命名・パス・WebP 前提**で記載。差異がある場合は実コードと合意を優先）。

---

## 5. JavaScript のルール

- エントリは `src/js/script.js`（ビルド後 `dist/assets/js/script.js`）。
- **DOM 操作**は、可能な限り `js-` クラスやデータ属性でターゲットを限定する。
- 本プロジェクトの例:
  - `observeElements(selector, activeClass)` … `IntersectionObserver` で表示時に `is-active` などを付与
  - `wrapTextInSpans(selector)` … 1 文字ずつ `span` 化する演出用（アクセシビリティ用の `aria-label` 等をセット）

新規機能を追加する場合も、**グローバル汚染を避け**、IIFE やモジュール化方針が決まっていればそれに従います。

---

## 6. フォーマット（エディタ）

- ルートの `.jsbeautifyrc` に準拠: HTML / CSS / JS は **インデント 2 スペース**。

---

## 7. `gas-water-heater-repair` → `gas-water-heater` 対応表（イメージ）

| 種別 | 旧（例） | 新（例） |
|------|-----------|-----------|
| 画像フォルダ | `src/images/gas-water-heater-repair/` | `src/images/gas-water-heater/` |
| SCSS ファイル | `_gas-water-heater-repair-fv.scss` | `_gas-water-heater-fv.scss` |
| ブロック class | `.gas-water-heater-repair-fv` | `.gas-water-heater-fv` |
| img パス | `.../gas-water-heater-repair/...` | `.../gas-water-heater/...` |

リネーム時は **HTML・SCSS・画像パスを同時に**置換し、Gulp で `dist` を再生成して差分を確認してください。

---

## 8. 改訂時のメモ

- 本ルールは「現状コードの要約」です。実装と矛盾した場合は**実コードまたはチーム合意**を優先し、本書を更新してください。

---

## 9. Figma と MCP（デザイン取得・AI 作業）

- **Cursor / Copilot 等で Figma の画面 URL を貼るだけで取得してよい**流れにする。依頼文に毎回「`figma-developer-mcp を使って、以下の URL から node-id=… を取得してください」などの定型を書く必要はない。
- AI は URL から **`fileKey`**（`figma.com/design/<fileKey>/`）と **`node-id`**（`?node-id=2027-207`）を取り出し、`node-id` の **ハイフンをコロンに**（例: `2027-207` → `2027:207`）して **figma-developer-mcp の `get_figma_data`** でノードを取得し、タイポ・余白・文言を実装に反映する。
- デザインと実装の優先順位・スクリーンショット差分は従来どおり**ユーザー指示と既存パターン**に従う。
