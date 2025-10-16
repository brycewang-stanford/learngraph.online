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
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

// Cusdis configuration
const host = 'https://cusdis.com'
const appId = '9a1060ba-ab12-4429-a517-44a5b140e2d6'

// Page information
const pageId = ref('')
const pageUrl = ref('')
const pageTitle = ref('')

// 强制拉高 Cusdis iframe 高度，避免内部滚动条，尽量显示全部历史评论
function bumpIframeHeight() {
  const iframe = document.querySelector('#cusdis_thread iframe')
  if (!iframe) return
  // 以视窗高度为基准，给出较大的最小高度（近似 BBS 全展开效果）
  const base = Math.max(window.innerHeight * 2, 1400)
  iframe.style.minHeight = base + 'px'
  iframe.style.height = base + 'px'
  iframe.style.maxHeight = 'none'
  iframe.style.overflow = 'visible'
}

let mo = null

onMounted(() => {
  // 设置页面信息
  pageId.value = route.path || '/feedback'
  pageUrl.value = typeof window !== 'undefined' ? window.location.href : ''
  pageTitle.value = document.title || 'LangGraph Lightning - 问题反馈'

  // 简单加载 Cusdis 脚本，不做任何额外处理
  if (!document.querySelector('#cusdis-script')) {
    const script = document.createElement('script')
    script.id = 'cusdis-script'
    script.src = 'https://cusdis.com/js/cusdis.es.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }

  // 监听 iframe 插入或更新，强制拉高高度
  const host = document.getElementById('cusdis_thread')
  if (host && typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver(() => bumpIframeHeight())
    mo.observe(host, { childList: true, subtree: true })
  }

  // 当 Cusdis 发出高度同步消息时，再次提升高度，规避其内部可能的 max-height 限制
  const onMsg = (e) => {
    if (typeof e.origin === 'string' && e.origin.includes('cusdis')) {
      bumpIframeHeight()
    }
  }
  window.addEventListener('message', onMsg)

  // 视窗改变时也拉高（移动端横竖屏切换等）
  const onResize = () => bumpIframeHeight()
  window.addEventListener('resize', onResize)

  // 初始尝试多次，确保脚本加载完成后生效
  setTimeout(bumpIframeHeight, 500)
  setTimeout(bumpIframeHeight, 1200)
  setTimeout(bumpIframeHeight, 2500)

  // 清理
  onBeforeUnmount(() => {
    if (mo) mo.disconnect()
    window.removeEventListener('message', onMsg)
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.comments-container {
  /* 保持只影响评论容器本身，宽度与文档主体一致 */
  margin-top: 1rem;
  padding: 0;
  width: 100%;
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
  margin: 1rem auto;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 2px solid var(--vp-c-brand-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  /* 避免内容被裁剪，确保历史评论可见 */
  overflow: visible;
}

/* Cusdis 样式美化 - 强制显示所有内容 */
:deep(#cusdis_thread) {
  width: 100%;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 适配 Cusdis iframe 尺寸，确保可完全展开显示 */
:deep(#cusdis_thread iframe) {
  width: 100% !important;
  /* 直接给出较大的最小高度与显式高度，避免出现内部滚动条 */
  min-height: 1400px !important;
  height: 1400px !important;
  max-height: none !important;
  display: block;
  border: 0;
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

/* 无需额外窄屏适配：随主体容器自适应 */
</style>
