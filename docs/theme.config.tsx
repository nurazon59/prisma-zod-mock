import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Prisma Zod Mock</span>,
  project: {
    link: 'https://github.com/yourusername/prisma-zod-mock',
  },
  docsRepositoryBase: 'https://github.com/yourusername/prisma-zod-mock/tree/main/docs',
  footer: {
    text: 'Prisma Zod Mock Documentation',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Prisma Zod Mock'
    }
  },
  primaryHue: 200,
  i18n: [
    { locale: 'en', text: 'English' },
    { locale: 'ja', text: '日本語' }
  ],
}

export default config