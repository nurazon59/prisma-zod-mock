import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>prisma-zod-mock</span>,
  project: {
    link: 'https://github.com/h-takeyeah/prisma-zod-mock',
  },
  docsRepositoryBase: 'https://github.com/h-takeyeah/prisma-zod-mock/tree/main/docs',
  footer: {
    text: 'prisma-zod-mock Documentation',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – prisma-zod-mock'
    }
  },
  primaryHue: 212,
  i18n: [
    { locale: 'ja', text: '日本語' }
  ],
  navigation: {
    prev: true,
    next: true
  },
  toc: {
    title: '目次',
    float: true,
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  editLink: {
    text: 'GitHubで編集 →'
  },
  feedback: {
    content: 'フィードバックをする →',
    labels: 'feedback'
  },
  search: {
    placeholder: '検索...'
  }
}

export default config