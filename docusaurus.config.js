// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '王开琦的个人小站',
  tagline: '记录学习、留住生活，尝试坚持写一点东西，让每天过的慢一点。',
  url: 'https://wkq.pub',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',


  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          include: ['**/*.md', '**/*.mdx'],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
          ],
        },
        blog: {
          showReadingTime: true,
          // postsPerPage: 'ALL',
          blogSidebarTitle: '全部博文',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'java/index',
            position: 'left',
            label: 'Java',
          },
          {
            type: 'doc',
            docId: 'mysql/index',
            position: 'left',
            label: 'MySQL',
          },
          {
            type: 'doc',
            docId: 'designmode/index',
            position: 'left',
            label: '设计模式',
          },
          {
            type: 'doc',
            docId: 'distributed/index',
            position: 'left',
            label: '分布式',
          },
          {
            type: 'doc',
            docId: 'elk/index',
            position: 'left',
            label: '搜索引擎',
          },


          {to: '/blog', label: '随笔', position: 'right'},
          {
            href: 'https://github.com/wkq1997',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: require('prism-react-renderer/themes/github'),
        darkTheme: require('prism-react-renderer/themes/dracula'),
        additionalLanguages: ['java','powershell','sql','bash','git','makefile','yaml','json'],
        // theme: lightCodeTheme,
        // darkTheme: darkCodeTheme,
      },
      docs: {
        sidebar: {
          //展开一个侧边栏是时折叠所有的同级别类别
          autoCollapseCategories: true,
          //使整个侧边栏变得可隐藏
          hideable: true, 
        },
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} wkq.pub 陇ICP备2021003596号.`,
      },
    }),

};

module.exports = config;
