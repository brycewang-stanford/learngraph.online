// .vitepress/theme/index.ts
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import FeedbackButton from './FeedbackButton.vue'
import SidebarToggle from './SidebarToggle.vue'
import PythonEditor from '../components/PythonEditor.vue'
import PythonEditorAPI from '../components/PythonEditorAPI.vue'
import PythonEditorLite from '../components/PythonEditorLite.vue'
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
    app.component('PythonEditorAPI', PythonEditorAPI)  // FastAPI 版本
    app.component('PythonEditorLite', PythonEditorLite)  // 轻量级版本（无 Monaco）

    // 在浏览器环境中预加载 Pyodide（仅当使用 Pyodide 版本时）
    // 现在我们优先使用 FastAPI，Pyodide 作为备选
    if (typeof window !== 'undefined') {
      // 检查是否应该使用 Pyodide（可以通过环境变量控制）
      const usePyodide = import.meta.env.VITE_USE_PYODIDE === 'true'

      if (usePyodide) {
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
  }
} satisfies Theme
