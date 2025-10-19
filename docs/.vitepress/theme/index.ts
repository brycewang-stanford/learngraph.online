// .vitepress/theme/index.ts
import { h, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import FeedbackButton from './FeedbackButton.vue'
import SidebarToggle from './SidebarToggle.vue'
import PythonEditor from '../components/PythonEditor.vue'
import PythonEditorAPI from '../components/PythonEditorAPI.vue'
import PythonEditorLite from '../components/PythonEditorLite.vue'
// EnhancedCodeBlock 和 ApiKeyManager 将在客户端动态导入
import { pyodideManager } from '../utils/pyodide-manager'
import { enableCodeBlockEditing } from '../utils/code-block-editor'

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
    app.component('PythonEditorAPI', PythonEditorAPI)
    app.component('PythonEditorLite', PythonEditorLite)
    // EnhancedCodeBlock 和 ApiKeyManager 将在动态增强时按需加载

    // 在浏览器环境中自动增强 Python 代码块
    if (typeof window !== 'undefined') {
      // 路由变化时增强代码块
      router.onAfterRouteChanged = (to) => {
        nextTick(() => {
          enhancePythonCodeBlocks(app)
          enableCodeBlockEditing()
        })
      }

      // 初始页面加载时增强代码块
      router.onAfterPageLoad = () => {
        nextTick(() => {
          enhancePythonCodeBlocks(app)
          enableCodeBlockEditing()
        })
      }
    }
  }
} satisfies Theme

/**
 * 自动增强页面中的所有 Python 代码块
 * 将普通的 <pre><code class="language-python"> 替换为 EnhancedCodeBlock 组件
 */
function enhancePythonCodeBlocks(app: any) {
  try {
    // 调试：查找所有可能的代码块
    const allCodeBlocks = document.querySelectorAll('div[class*="language-"]')
    const allPreBlocks = document.querySelectorAll('pre')
    console.log(`[EnhancedCodeBlock] Found ${allCodeBlocks.length} language-* divs`)
    console.log(`[EnhancedCodeBlock] Found ${allPreBlocks.length} pre elements`)

    // 查找所有 Python 代码块 - 尝试多种选择器
    let codeBlocks = document.querySelectorAll('div.language-python pre code')

    if (codeBlocks.length === 0) {
      // 备用选择器
      codeBlocks = document.querySelectorAll('pre code.language-python')
    }

    console.log(`[EnhancedCodeBlock] Found ${codeBlocks.length} Python code blocks`)

    codeBlocks.forEach((codeElement, index) => {
      const preElement = codeElement.parentElement as HTMLElement

      // 避免重复处理
      if (preElement.getAttribute('data-enhanced') === 'true') {
        return
      }

      // 标记为已处理
      preElement.setAttribute('data-enhanced', 'true')

      // 获取代码内容
      const code = codeElement.textContent || ''

      // 创建容器
      const container = document.createElement('div')
      container.setAttribute('data-enhanced-code-block', index.toString())

      // 替换原始代码块
      preElement.replaceWith(container)

      // 使用 Vue 的 createApp 动态挂载组件
      Promise.all([
        import('vue'),
        import('../components/EnhancedCodeBlock.vue'),
        import('../components/ApiKeyManager.vue')
      ]).then(([{ createApp }, EnhancedCodeBlockModule, ApiKeyManagerModule]) => {
        const EnhancedCodeBlock = EnhancedCodeBlockModule.default
        const ApiKeyManager = ApiKeyManagerModule.default

        const enhancedApp = createApp(EnhancedCodeBlock, {
          code: code,
          language: 'python'
        })

        // 注册 ApiKeyManager 组件
        enhancedApp.component('ApiKeyManager', ApiKeyManager)

        enhancedApp.mount(container)
      }).catch(error => {
        console.error('[EnhancedCodeBlock] Failed to load components:', error)
      })
    })
  } catch (error) {
    console.error('[EnhancedCodeBlock] Error enhancing code blocks:', error)
  }
}
