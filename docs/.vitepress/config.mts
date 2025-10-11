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
    
    sidebar.push({
      text: `第 ${moduleNumber} 章`,
      collapsed: false,
      items: items
    })
  }
  
  return sidebar
}

export default defineConfig({
  title: 'LangGraph Lightning',
  description: '基于 LangChain Academy 的深度解读与工程实战指南',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'LangGraph,LangChain,AI,Agent,Multi-Agent,Python,教程,实战' }],
    ['meta', { name: 'author', content: 'Bryce Wang' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/module-0/0.1-Python Basics' },
      { 
        text: '课程章节',
        items: [
          { text: '第 0 章 - 基础入门', link: '/module-0/0.2-LangGraph Basics-详细解读' },
          { text: '第 1 章 - 核心概念', link: '/module-1/1.1-simple-graph-详细解读' },
          { text: '第 2 章 - 状态管理', link: '/module-2/2.1-state-schema-详细解读' },
          { text: '第 3 章 - 人机协作', link: '/module-3/breakpoints-详细解读' },
          { text: '第 4 章 - 高级模式', link: '/module-4/4.1-parallelization-详细解读' }
        ]
      },
      { text: 'GitHub', link: 'https://github.com/brycewang-stanford/langgraph-lightning' }
    ],
    
    sidebar: getModuleSidebar(),
    
    outline: {
      level: [2, 3],
      label: '目录'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/brycewang-stanford/langgraph-lightning' }
    ],
    
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024-present Bryce Wang'
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
      pattern: 'https://github.com/brycewang-stanford/langgraph-lightning/edit/main/:path',
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
  srcDir: '..',
  outDir: './docs/.vitepress/dist'
})
