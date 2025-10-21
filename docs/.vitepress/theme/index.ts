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
import AdminLogin from '../components/AdminLogin.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
// EnhancedCodeBlock 和 ApiKeyManager 将在客户端动态导入
import { pyodideManager } from '../utils/pyodide-manager'
import { enableCodeBlockEditing } from '../utils/code-block-editor'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'nav-bar-content-after': () => h(AdminLogin),
      'layout-bottom': () => [h(FeedbackButton), h(SidebarToggle), h(MarkdownEditor)]
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
      // 使用多重策略确保代码块被正确增强
      const enhanceWithRetry = () => {
        // 立即尝试增强
        enhancePythonCodeBlocks(app)
        enableCodeBlockEditing()

        // 使用 nextTick 再次尝试
        nextTick(() => {
          enhancePythonCodeBlocks(app)
          enableCodeBlockEditing()
        })

        // 使用延迟作为最后的保障
        setTimeout(() => {
          enhancePythonCodeBlocks(app)
          enableCodeBlockEditing()
        }, 100)
      }

      // 路由变化时增强代码块
      router.onAfterRouteChanged = (to) => {
        enhanceWithRetry()
      }

      // 初始页面加载时增强代码块
      router.onAfterPageLoad = () => {
        enhanceWithRetry()
      }

      // 使用 MutationObserver 监听 DOM 变化，确保新添加的代码块被增强
      const observer = new MutationObserver((mutations) => {
        let shouldEnhance = false
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              const element = node as Element
              // 检查是否是代码块或包含代码块
              if (element.classList?.contains('language-python') ||
                  element.querySelector?.('.language-python') ||
                  element.querySelector?.('code.language-python')) {
                shouldEnhance = true
              }
            }
          })
        })

        if (shouldEnhance) {
          nextTick(() => {
            enhancePythonCodeBlocks(app)
            enableCodeBlockEditing()
          })
        }
      })

      // 观察整个文档的变化
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  }
} satisfies Theme

// 全局跟踪已增强的代码块，防止重复处理
const enhancedCodeBlocks = new WeakSet<HTMLElement>()

/**
 * 自动增强页面中的所有 Python 代码块
 * 将普通的 <pre><code class="language-python"> 替换为 EnhancedCodeBlock 组件
 */
function enhancePythonCodeBlocks(app: any) {
  try {
    // 查找所有 Python 代码块 - 尝试多种选择器
    let codeBlocks = document.querySelectorAll('div.language-python pre code') as NodeListOf<HTMLElement>

    if (codeBlocks.length === 0) {
      // 备用选择器
      codeBlocks = document.querySelectorAll('pre code.language-python') as NodeListOf<HTMLElement>
    }

    console.log(`[EnhancedCodeBlock] Found ${codeBlocks.length} Python code blocks to check`)

    let enhancedCount = 0
    let skippedCount = 0

    codeBlocks.forEach((codeElement, index) => {
      const preElement = codeElement.parentElement as HTMLElement
      if (!preElement) return

      // 多层检查避免重复处理
      // 1. 检查是否已经在 WeakSet 中
      if (enhancedCodeBlocks.has(preElement)) {
        skippedCount++
        return
      }

      // 2. 检查是否有 data-enhanced 属性
      if (preElement.getAttribute('data-enhanced') === 'true') {
        enhancedCodeBlocks.add(preElement)
        skippedCount++
        return
      }

      // 3. 检查父元素是否已经是增强组件容器
      const parentDiv = preElement.closest('[data-enhanced-code-block]')
      if (parentDiv) {
        skippedCount++
        return
      }

      // 4. 检查是否已经被 Vue 组件包裹
      const hasVueComponent = preElement.closest('.enhanced-code-block')
      if (hasVueComponent) {
        skippedCount++
        return
      }

      // 标记为已处理（在 WeakSet 和 DOM 属性中都标记）
      enhancedCodeBlocks.add(preElement)
      preElement.setAttribute('data-enhanced', 'true')

      // 获取代码内容
      const code = codeElement.textContent || ''

      // 创建容器
      const container = document.createElement('div')
      const uniqueId = `enhanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      container.setAttribute('data-enhanced-code-block', uniqueId)
      container.setAttribute('data-enhanced', 'true')

      // 替换原始代码块
      preElement.replaceWith(container)
      enhancedCount++

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

    // 输出统计信息
    console.log(`[EnhancedCodeBlock] Enhanced: ${enhancedCount}, Skipped: ${skippedCount}`)
  } catch (error) {
    console.error('[EnhancedCodeBlock] Error enhancing code blocks:', error)
  }
}
