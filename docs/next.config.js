const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 相対パスで出力（静的ファイル用）
  assetPrefix: './',
};

module.exports = withNextra(nextConfig);
