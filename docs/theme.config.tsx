import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';

const config: DocsThemeConfig = {
  logo: <span>prisma-zod-mock</span>,
  project: {
    link: 'https://github.com/h-takeyeah/prisma-zod-mock',
  },
  docsRepositoryBase: 'https://github.com/h-takeyeah/prisma-zod-mock/tree/main/docs',
  footer: {
    text: 'prisma-zod-mock Documentation',
  },
  primaryHue: 212,
  i18n: [
    { locale: 'ja', text: '日本語' },
    { locale: 'en', text: 'English' },
  ],
  navigation: {
    prev: true,
    next: true,
  },
  toc: {
    title: () => {
      const { pathname } = useRouter();
      return pathname.startsWith('/en') ? 'Table of Contents' : '目次';
    },
    float: true,
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  editLink: {
    text: () => {
      const { pathname } = useRouter();
      return pathname.startsWith('/en') ? 'Edit on GitHub →' : 'GitHubで編集 →';
    },
  },
  feedback: {
    content: () => {
      const { pathname } = useRouter();
      return pathname.startsWith('/en') ? 'Give feedback →' : 'フィードバックをする →';
    },
    labels: 'feedback',
  },
  search: {
    placeholder: () => {
      const { pathname } = useRouter();
      return pathname.startsWith('/en') ? 'Search...' : '検索...';
    },
  },
  useNextSeoProps() {
    const { pathname } = useRouter();
    const isEnglish = pathname.startsWith('/en');
    return {
      titleTemplate: isEnglish ? '%s – prisma-zod-mock' : '%s – prisma-zod-mock',
    };
  },
  head: () => {
    const { pathname } = useRouter();
    const isEnglish = pathname.startsWith('/en');

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="prisma-zod-mock" />
        <meta
          property="og:description"
          content={
            isEnglish
              ? 'Generate Zod schemas and mock data from Prisma schemas'
              : 'PrismaスキーマからZodスキーマとモックデータを生成'
          }
        />
        {/* Language switcher */}
        <link
          rel="alternate"
          hrefLang={isEnglish ? 'ja' : 'en'}
          href={isEnglish ? pathname.replace('/en', '') : `/en${pathname}`}
        />
      </>
    );
  },
};

export default config;
