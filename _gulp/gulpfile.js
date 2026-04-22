const { src, dest, watch, series, parallel } = require("gulp"); // Gulpの基本関数をインポート
const sass = require("gulp-sass")(require("sass")); // SCSSをCSSにコンパイルするためのモジュール
const plumber = require("gulp-plumber"); // エラーが発生してもタスクを続行するためのモジュール
const notify = require("gulp-notify"); // エラーやタスク完了の通知を表示するためのモジュール
const sassGlob = require("gulp-sass-glob-use-forward"); // SCSSのインポートを簡略化するためのモジュール
const mmq = require("gulp-merge-media-queries"); // メディアクエリをマージするためのモジュール
const postcss = require("gulp-postcss"); // CSSの変換処理を行うためのモジュール
const autoprefixer = require("autoprefixer"); // ベンダープレフィックスを自動的に追加するためのモジュール
const cssdeclsort = require("css-declaration-sorter"); // CSSの宣言をソートするためのモジュール
const postcssPresetEnv = require("postcss-preset-env"); // 最新のCSS構文を使用可能にするためのモジュール
const discardDuplicates = require("postcss-discard-duplicates"); // 重複するCSSプロパティを削除するためのモジュール
const removeGridGap = require("./remove-grid-gap"); // grid-gapプロパティを削除するカスタムプラグイン
const sourcemaps = require("gulp-sourcemaps"); // ソースマップを作成するためのモジュール
const babel = require("gulp-babel"); // ES6+のJavaScriptをES5に変換するためのモジュール
const imageminSvgo = require("imagemin-svgo"); // SVGを最適化するためのモジュール
const browserSync = require("browser-sync"); // ブラウザの自動リロード機能を提供するためのモジュール
const imagemin = require("gulp-imagemin"); // 画像を最適化するためのモジュール
const imageminMozjpeg = require("imagemin-mozjpeg"); // JPEGを最適化するためのモジュール
const imageminPngquant = require("imagemin-pngquant"); // PNGを最適化するためのモジュール
const changed = require("gulp-changed"); // 変更されたファイルのみを対象にするためのモジュール
const del = require("del"); // ファイルやディレクトリを削除するためのモジュール
const webp = require("gulp-webp"); // WebP 変換（ラスターのみ dist に .webp を出力）

// 読み込み先
const srcPath = {
  css: "../src/sass/**/*.scss",
  cssRaw: "../src/css/**/*.css",
  js: "../src/js/**/*",
  img: "../src/images/**/*",
  html: ["../src/**/*.html", "!./node_modules/**"],
};

// html反映用
const destPath = {
  all: "../dist/**/*",
  css: "../dist/assets/css/",
  js: "../dist/assets/js/",
  img: "../dist/assets/images/",
  html: "../dist/",
};

// browserslistはpackage.jsonで管理

// HTMLファイルのコピー
const htmlCopy = () => {
  return src(srcPath.html).pipe(dest(destPath.html));
};

// SCSS パイプライン外で管理する純 CSS（src/css）を dist にコピー
const cssRawCopy = () => {
  return src(srcPath.cssRaw).pipe(dest(destPath.css));
};

const cssSass = () => {
  // ソースファイルを指定
  return (
    src(srcPath.css)
      // ソースマップを初期化
      .pipe(sourcemaps.init())
      // エラーハンドリングを設定
      .pipe(
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      // Sassのパーシャル（_ファイル）を自動的にインポート
      .pipe(sassGlob())
      // SassをCSSにコンパイル
      .pipe(
        sass.sync({
          includePaths: ["src/sass"],
          outputStyle: "expanded", // コンパイル後のCSSの書式（expanded or compressed）
        })
      )
      // ベンダープレフィックスを自動付与、CSSプロパティをアルファベット順にソート、未来のCSS構文を使用可能に
      .pipe(
        postcss([
          autoprefixer({
            grid: false
          }),
          cssdeclsort({
            order: "alphabetical"
          }),
          postcssPresetEnv({
            preserve: true,
            features: {
              'custom-properties': false,
              'nesting-rules': true,
              'grid-template-areas': false,
              'grid-area': false,
              'gap-properties': { preserve: true } // gapプロパティを保持する設定
            },
            autoprefixer: false,
            enableClientSidePolyfills: false
          }),
          discardDuplicates(), // 重複するCSSプロパティを削除
          removeGridGap() // grid-gapプロパティを削除
        ])
      )
      // メディアクエリを統合
      .pipe(mmq())
      // ソースマップを書き出し
      .pipe(sourcemaps.write("./"))
      // コンパイル済みのCSSファイルを出力先に保存
      .pipe(dest(destPath.css))
      // Sassコンパイルが完了したことを通知
      .pipe(
        notify({
          message: "Sassをコンパイルしました！",
          onLast: true,
        })
      )
  );
};

// ラスター画像: 圧縮 → WebP のみ dist に出力（PNG/JPG は出力しない）
const imgRasterWebp = () => {
  return (
    src(["../src/images/**/*.{png,jpg,jpeg}"], { base: "../src/images" })
      .pipe(changed(destPath.img, { extension: ".webp" }))
      .pipe(
        imagemin(
          [
            imageminMozjpeg({
              quality: 85,
            }),
            imageminPngquant(),
          ],
          {
            verbose: true,
          }
        )
      )
      .pipe(webp())
      .pipe(dest(destPath.img))
  );
};

// SVG: 最適化して .svg のまま出力（ベクターアイコン用。ラスターと違い dist に .webp は作らない）
const imgSvg = () => {
  return (
    src("../src/images/**/*.svg", { base: "../src/images" })
      .pipe(changed(destPath.img))
      .pipe(
        imagemin(
          [
            imageminSvgo({
              plugins: [
                {
                  removeViewbox: false,
                },
              ],
            }),
          ],
          {
            verbose: true,
          }
        )
      )
      .pipe(dest(destPath.img))
  );
};

// dist に残った PNG/JPG/JPEG を削除（旧パイプラインの残骸や手動コピー対策。開発 watch / build 共通）
const imgRemoveRasterFromDist = () =>
  del(
    [
      "../dist/assets/images/**/*.png",
      "../dist/assets/images/**/*.jpg",
      "../dist/assets/images/**/*.jpeg",
    ],
    { force: true }
  );

// 画像処理: ラスターは WebP のみ出力 → 続けて dist からラスター拡張子を一掃
const imgImagemin = series(parallel(imgRasterWebp, imgSvg), imgRemoveRasterFromDist);

// js圧縮
const jsBabel = () => {
  // JavaScriptファイルを指定
  return (
    src(srcPath.js)
      // エラーハンドリングを設定
      .pipe(
        plumber({
          errorHandler: notify.onError("Error: <%= error.message %>"),
        })
      )
      // Babelでトランスパイル（ES6からES5へ変換）
      .pipe(
        babel({
          presets: ["@babel/preset-env"],
        })
      )
      // 圧縮済みのファイルを出力先に保存
      .pipe(dest(destPath.js))
  );
};

// ブラウザーシンク
const browserSyncOption = {
  notify: false,
  server: "../dist/",
};
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
};
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

// ファイルの削除
const clean = () => {
  return del(destPath.all, { force: true });
};
// ファイルの監視
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload));
  watch(srcPath.cssRaw, series(cssRawCopy, browserSyncReload));
  watch(srcPath.js, series(jsBabel, browserSyncReload));
  watch(srcPath.img, series(imgImagemin, browserSyncReload));
  watch(srcPath.html, series(htmlCopy, browserSyncReload));
};

// ブラウザシンク付きの開発用タスク
exports.default = series(series(cssSass, cssRawCopy, jsBabel, imgImagemin, htmlCopy), parallel(watchFiles, browserSyncFunc));

// 本番用タスク
exports.build = series(clean, cssSass, cssRawCopy, jsBabel, imgImagemin, htmlCopy);
