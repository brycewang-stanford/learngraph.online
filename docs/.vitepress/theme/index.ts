// .vitepress/theme/index.ts
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import FeedbackButton from './FeedbackButton.vue'
import SidebarToggle from './SidebarToggle.vue'
import PythonEditor from '../components/PythonEditor.vue'
import { pyodideManager } from '../utils/pyodide-manager'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => [h(FeedbackButton), h(SidebarToggle)]
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('PythonEditor', PythonEditor)

    // 在浏览器环境中预加载 Pyodide
    if (typeof window !== 'undefined') {
      // 延迟 2 秒后开始预加载，避免影响首屏渲染
      setTimeout(() => {
        console.log('🚀 Starting Pyodide preload in background...')
        pyodideManager.initialize().then(() => {
          console.log('✅ Pyodide preloaded successfully!')
        }).catch(err => {
          console.warn('⚠️ Pyodide preload failed, will load on demand:', err)
        })
      }, 2000)
    }
  }
} satisfies Theme
