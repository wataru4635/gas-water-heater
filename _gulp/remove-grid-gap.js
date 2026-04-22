/**
 * PostCSSプラグイン: grid-gapプロパティを削除する
 * このプラグインはgrid-gapプロパティを見つけて削除します
 */
module.exports = () => {
  return {
    postcssPlugin: 'remove-grid-gap',
    Declaration(decl) {
      // grid-gapプロパティを見つけたら削除
      if (decl.prop === 'grid-gap') {
        decl.remove();
      }
    }
  };
};

module.exports.postcss = true;
