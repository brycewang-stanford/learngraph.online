<template>
  <div class="comments-container">
    <div class="comments-header">
      <h2>💬 讨论区 / Discussion</h2>
      <p class="comments-subtitle">
        欢迎留下您的问题和建议，无需登录 | Feel free to leave your feedback, no login required
      </p>
    </div>

    <!-- Cusdis 评论框容器 - 直接显示 -->
    <div class="cusdis-wrapper">
      <div
        id="cusdis_thread"
        :data-host="host"
        :data-app-id="appId"
        :data-page-id="pageId"
        :data-page-url="pageUrl"
        :data-page-title="pageTitle"
      />
    </div>

    <!-- 评论提示信息 -->
    <div class="comment-tips">
      <h4>💡 小贴士 / Tips:</h4>
      <ul>
        <li>无需登录即可评论 | No login required to comment</li>
        <li>支持 Markdown 语法，可以插入代码块、链接等 | Markdown syntax supported</li>
        <li>友善交流，共同进步 | Be friendly and professional</li>
        <li>评论将在审核后显示 | Comments will appear after moderation</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

// Cusdis configuration
const host = 'https://cusdis.com'
const appId = '9a1060ba-ab12-4429-a517-44a5b140e2d6'

// Page information
const pageId = ref('')
const pageUrl = ref('')
const pageTitle = ref('')

onMounted(() => {
  // 设置页面信息
  pageId.value = route.path || '/feedback'
  pageUrl.value = typeof window !== 'undefined' ? window.location.href : ''
  pageTitle.value = document.title || 'LangGraph Lightning - 问题反馈'

  // 加载 Cusdis 脚本
  if (!document.querySelector('#cusdis-script')) {
    const script = document.createElement('script')
    script.id = 'cusdis-script'
    script.src = 'https://cusdis.com/js/cusdis.es.js'
    script.async = true
    script.defer = true

    // 脚本加载完成后，强制展开所有内容
    script.onload = () => {
      // 超级强力的展开函数
      const superForceExpand = () => {
        // 1. 处理所有可能的容器
        const allElements = document.querySelectorAll('*')
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el)

          // 检查是否有滚动或高度限制
          if (computedStyle.overflow === 'auto' ||
              computedStyle.overflow === 'scroll' ||
              computedStyle.overflowY === 'auto' ||
              computedStyle.overflowY === 'scroll' ||
              computedStyle.maxHeight !== 'none') {

            // 如果元素包含评论相关内容，强制展开
            if (el.id?.includes('cusdis') ||
                el.className?.includes('comment') ||
                el.className?.includes('cusdis')) {
              el.style.cssText += `
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                overflow-y: visible !important;
                min-height: auto !important;
              `
            }
          }
        })

        // 2. 特殊处理 iframe
        const iframes = document.querySelectorAll('iframe')
        iframes.forEach(iframe => {
          iframe.style.cssText = `
            width: 100% !important;
            height: 2000px !important;
            min-height: 2000px !important;
            border: none !important;
            overflow: visible !important;
          `

          // 尝试访问 iframe 内容（如果同源）
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (iframeDoc) {
              const iframeElements = iframeDoc.querySelectorAll('*')
              iframeElements.forEach(el => {
                if (el.style) {
                  el.style.maxHeight = 'none'
                  el.style.overflow = 'visible'
                }
              })
            }
          } catch (e) {
            console.log('Cannot access iframe content (cross-origin)')
          }
        })

        // 3. 注入全局样式
        if (!document.querySelector('#force-expand-style')) {
          const style = document.createElement('style')
          style.id = 'force-expand-style'
          style.innerHTML = `
            #cusdis_thread,
            #cusdis_thread *,
            .cusdis-comment-list,
            [class*="comment-list"],
            [id*="comment-list"] {
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              overflow-y: visible !important;
            }

            /* 隐藏所有滚动条 */
            #cusdis_thread::-webkit-scrollbar,
            #cusdis_thread *::-webkit-scrollbar {
              display: none !important;
            }

            /* 确保 iframe 足够高 */
            iframe {
              min-height: 2000px !important;
            }
          `
          document.head.appendChild(style)
        }
      }

      // 多次执行，确保生效
      setTimeout(superForceExpand, 100)
      setTimeout(superForceExpand, 500)
      setTimeout(superForceExpand, 1000)
      setTimeout(superForceExpand, 2000)
      setTimeout(superForceExpand, 3000)

      // 监听 DOM 变化，持续强制展开
      const observer = new MutationObserver(() => {
        superForceExpand()
      })

      setTimeout(() => {
        const target = document.querySelector('#cusdis_thread')
        if (target) {
          observer.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          })
        }
      }, 1000)
    }

    document.body.appendChild(script)
  }
})
</script>

<style scoped>
.comments-container {
  margin-top: 1rem;
  padding: 0;
  max-width: 100%;
}

.comments-header {
  margin-bottom: 1rem;
  text-align: center;
}

.comments-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--vp-c-text-1);
}

.comments-subtitle {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0;
}

/* Cusdis 容器 - 减少间距 */
.cusdis-wrapper {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 2px solid var(--vp-c-brand-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Cusdis 样式美化 - 强制显示所有内容 */
:deep(#cusdis_thread) {
  width: 100%;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 强制 Cusdis 所有内部容器展开 - 更全面的选择器 */
:deep(#cusdis_thread *) {
  max-height: none !important;
  overflow: visible !important;
}

/* 专门针对可能的评论容器 */
:deep(#cusdis_thread > div),
:deep(#cusdis_thread > div > div) {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 评论输入框区域 - 更紧凑的布局 */
:deep(.cusdis-comment-box) {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 输入框样式 - 减小间距 */
:deep(.cusdis-comment-box input) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  border-radius: 4px;
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
  margin-bottom: 0;
}

/* 文本域 - 可自由调整大小 */
:deep(.cusdis-comment-box textarea) {
  width: 100%;
  min-height: 100px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  border-radius: 4px;
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0;
}

/* 让输入框在焦点时更明显 */
:deep(.cusdis-comment-box input:focus),
:deep(.cusdis-comment-box textarea:focus) {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-dimm);
}

/* 提交按钮 - 更突出 */
:deep(.cusdis-comment-box button) {
  align-self: flex-start;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

:deep(.cusdis-comment-box button:hover) {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

/* 评论列表区域 - 强制显示所有评论 */
:deep(.cusdis-comment-list) {
  margin-top: 1.5rem;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block !important;
}

/* 强制所有评论容器展开 */
:deep(.cusdis-comments) {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 如果有滚动容器，强制它展开 - 更强力的规则 */
:deep([style*="overflow"]),
:deep([style*="height"]),
:deep([style*="max-height"]) {
  overflow: visible !important;
  max-height: none !important;
  height: auto !important;
}

/* 完全重置任何滚动样式 */
:deep(*) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

:deep(*::-webkit-scrollbar) {
  display: none !important;
}

:deep(.cusdis-comment-item) {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: block !important;
}

/* 评论提示 - 更紧凑 */
.comment-tips {
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.comment-tips h4 {
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.comment-tips ul {
  margin: 0;
  padding-left: 1.2rem;
}

.comment-tips li {
  color: var(--vp-c-text-2);
  margin-bottom: 0.3rem;
  line-height: 1.4;
}

/* 暗黑模式适配 */
.dark :deep(.cusdis-comment-box) {
  background: var(--vp-c-bg-alt);
}

.dark :deep(.cusdis-comment-box textarea),
.dark :deep(.cusdis-comment-box input) {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
/* 终极修复 - 强制展开所有内容 */
#cusdis_thread {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

#cusdis_thread > * {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 针对所有可能的嵌套容器 */
#cusdis_thread * {
  max-height: none !important;
  overflow: visible !important;
}

/* 针对 iframe 内容（如果 Cusdis 使用 iframe） */
:deep(iframe) {
  width: 100% !important;
  height: 1000px !important;
  min-height: 1000px !important;
  overflow: visible !important;
}

/* 确保评论列表完全可见 */
.cusdis-comment-list,
#cusdis-comment-list,
[class*="comment-list"],
[id*="comment-list"] {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block !important;
}

/* 确保每个评论项都可见 */
.cusdis-comment-item,
[class*="comment-item"] {
  display: block !important;
  visibility: visible !important;
}
</style>