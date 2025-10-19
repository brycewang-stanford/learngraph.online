import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// 自动扫描 module 目录生成侧边栏
function getModuleSidebar() {
  const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
  const moduleDirs = fs.readdirSync(rootDir)
    .filter(dir => dir.startsWith('module-') && fs.statSync(path.join(rootDir, dir)).isDirectory())
    .sort()
  
  const sidebar = []
  
  for (const moduleDir of moduleDirs) {
    const modulePath = path.join(rootDir, moduleDir)
    const files = fs.readdirSync(modulePath)
      .filter(file => file.endsWith('.md'))
      .sort()
    
    if (files.length === 0) continue
    
    const moduleNumber = moduleDir.replace('module-', '')
    const items = files.map(file => {
      const fileName = file.replace('.md', '')
      return {
        text: fileName,
        link: `/${moduleDir}/${file}`
      }
    })
    
    // 自定义部分章节的分组标题
    let moduleText = `第 ${moduleNumber} 章`
    if (moduleNumber === '0') moduleText = '第 0 章 前言'
    if (moduleNumber === '1') moduleText = '第 1 章 基础概念'
    if (moduleNumber === '2') moduleText = '第 2 章 核心机制'
    sidebar.push({
      text: moduleText,
      collapsed: false,
      items: items
    })
  }
  
  return sidebar
}

export default defineConfig({
  title: '《LangGraph 飞速上手 v0.1》',
  description: '基于 LangChain Academy 的深度解读与工程实战指南',
  lang: 'zh-CN',
  base: '/',
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'LangGraph,LangChain,AI,Agent,Multi-Agent,Python,教程,实战' }],
    ['meta', { name: 'author', content: 'Bryce Wang' }],
    // Google Analytics
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-RL5HPH60BZ' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RL5HPH60BZ');`]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '本书作者：王几行XING', link: 'https://www.zhihu.com/people/brycewang1898' },
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/module-0/0.0-LangGraph-上手案例' },
      {
        text: '课程章节',
        items: [
          { text: '第 0 章 前言 - 飞速上手', link: '/module-0/0.0-LangGraph-上手案例' },
          { text: '第 0 章 前言 - Python 基础', link: '/module-0/0.1-Python-基础入门' },
          { text: '第 0 章 前言 - LangGraph 入门', link: '/module-0/0.2-LangGraph-基础入门' },
          { text: '第 0 章 前言 - LangChain 介绍', link: '/module-0/0.3-补充-LangChain-快速介绍' },
          { text: '第 1 章 - 基础概念', link: '/module-1/1.1-simple-graph-最简图' },
          { text: '第 2 章 - 核心机制', link: '/module-2/2.1-state-schema-详细解读' },
          { text: '第 3 章 - 人机协作', link: '/module-3/breakpoints-详细解读' },
          { text: '第 4 章 - 高级模式', link: '/module-4/4.1-parallelization-详细解读' },
          { text: '第 5 章 - 记忆系统', link: '/module-5/5.1-memory_agent-详细解读' },
          { text: '第 6 章 - 生产部署', link: '/module-6/6.1-creating-详细解读' }
        ]
      },
      { text: '🐍 Python 编辑器（FastAPI）', link: '/python-api-playground' },
      { text: '📈 网站访问数据', link: 'https://analytics.google.com/analytics/web/?authuser=4#/a371083495p508309497/reports/intelligenthome' },
      { text: '反馈审核', link: 'https://cusdis.com/dashboard/project/9a1060ba-ab12-4429-a517-44a5b140e2d6' }
    ],
    
    sidebar: getModuleSidebar(),
    
    outline: {
      level: 'deep',
      label: '本页目录'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/brycewang-stanford/learngraph.online' }
    ],
    
    footer: {
      message: '基于 MIT 许可证发布。内容版权归作者所有。',
      copyright: 'Copyright © 2025-present 王几行XING（Bryce Wang）'
    },
    
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    
    editLink: {
      pattern: 'https://github.com/brycewang-stanford/learngraph.online/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    }
  },
  
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  
  // 设置文档根目录为项目根目录，这样可以直接访问 module-x 目录
  srcDir: '..'
})
