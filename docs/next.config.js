const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
}

module.exports = withNextra(nextConfig)