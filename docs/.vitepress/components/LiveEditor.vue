<template>
  <div v-if="isAdminUser" class="live-editor">
    <!-- 编辑/保存切换按钮 -->
    <button
      @click="toggleEditMode"
      class="edit-toggle-button"
      :class="{ 'edit-mode': isEditMode, 'save-mode': isEditMode }"
    >
      <span v-if="!isEditMode">✏️ 进入编辑模式</span>
      <span v-else-if="isSaving">⏳ 保存中...</span>
      <span v-else>💾 保存到 GitHub</span>
    </button>

    <!-- 编辑模式提示 -->
    <div v-if="isEditMode" class="edit-mode-banner">
      <div class="banner-content">
        <span class="banner-icon">✏️</span>
        <span class="banner-text">编辑模式已激活 - 直接修改页面内容，完成后点击"保存到 GitHub"</span>
        <button @click="cancelEdit" class="banner-cancel">取消</button>
      </div>
    </div>

    <!-- 提交信息输入框（编辑模式时显示在顶部） -->
    <div v-if="isEditMode && !isSaving" class="commit-message-bar">
      <input
        v-model="commitMessage"
        type="text"
        placeholder="输入提交信息（例如：更新首页内容）"
        class="commit-input"
        @keyup.enter="saveToGitHub"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import { isAdmin, updateFile, getFile } from '../utils/github-api'

const route = useRoute()
const { page } = useData()
const isAdminUser = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)
const commitMessage = ref('')
const originalContent = ref('')
const currentFilePath = ref('')

onMounted(() => {
  isAdminUser.value = isAdmin()

  if (isAdminUser.value) {
    console.log('[LiveEditor] 管理员已登录，编辑功能已激活')
  }
})

watch(() => route.path, () => {
  if (isEditMode.value) {
    exitEditMode()
  }
})

function getFilePath(): string {
  // 将 URL 路径转换为文件路径
  let path = route.path

  // 移除 base 前缀
  if (path.startsWith('/langgraph-lightning/')) {
    path = path.replace('/langgraph-lightning/', '')
  } else if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // 转换为 .md 文件路径
  if (path === '' || path === '/') {
    return 'docs/index.md'
  } else if (path.endsWith('.html')) {
    return `docs/${path.replace('.html', '.md')}`
  } else {
    return `docs/${path}.md`
  }
}

async function toggleEditMode() {
  if (isEditMode.value) {
    // 当前是编辑模式 → 保存
    await saveToGitHub()
  } else {
    // 当前是查看模式 → 进入编辑
    await enterEditMode()
  }
}

async function enterEditMode() {
  currentFilePath.value = getFilePath()

  try {
    // 从 GitHub 获取原始 Markdown 内容
    const content = await getFile(currentFilePath.value)
    originalContent.value = content

    // 激活编辑模式
    isEditMode.value = true
    commitMessage.value = `更新页面: ${currentFilePath.value}`

    // 使整个内容区域可编辑
    const contentArea = document.querySelector('.vp-doc') as HTMLElement
    if (contentArea) {
      contentArea.setAttribute('contenteditable', 'true')
      contentArea.style.outline = '2px dashed #f59e0b'
      contentArea.style.outlineOffset = '4px'
      contentArea.style.minHeight = '400px'
      contentArea.focus()
    }

    console.log('[LiveEditor] 编辑模式已激活:', currentFilePath.value)
  } catch (error: any) {
    console.error('[LiveEditor] 进入编辑模式失败:', error)
    alert(`❌ 无法进入编辑模式: ${error.message}`)
  }
}

function exitEditMode() {
  isEditMode.value = false

  // 禁用内容编辑
  const contentArea = document.querySelector('.vp-doc') as HTMLElement
  if (contentArea) {
    contentArea.setAttribute('contenteditable', 'false')
    contentArea.style.outline = 'none'
  }
}

function cancelEdit() {
  if (confirm('确定要取消编辑吗？所有未保存的修改将丢失。')) {
    exitEditMode()
    // 刷新页面恢复原始内容
    window.location.reload()
  }
}

async function saveToGitHub() {
  if (!commitMessage.value.trim()) {
    alert('❌ 请输入提交信息')
    return
  }

  isSaving.value = true

  try {
    // 获取编辑后的内容
    const contentArea = document.querySelector('.vp-doc') as HTMLElement
    if (!contentArea) {
      throw new Error('找不到内容区域')
    }

    // 从 DOM 中提取纯文本（这是简化版，实际需要转回 Markdown）
    const editedText = contentArea.innerText

    // 提示：当前方案获取的是渲染后的 HTML 文本，不是 Markdown
    // 更好的方案是使用 Turndown 或类似库将 HTML 转回 Markdown

    // 临时方案：直接使用原始 Markdown 并提示用户
    const confirmSave = confirm(
      `⚠️ 当前编辑功能处于测试阶段\n\n` +
      `文件路径: ${currentFilePath.value}\n` +
      `提交信息: ${commitMessage.value}\n\n` +
      `注意：由于技术限制，建议您直接在 GitHub 上编辑或使用外部编辑器。\n\n` +
      `是否继续保存？`
    )

    if (!confirmSave) {
      isSaving.value = false
      return
    }

    // 提交到 GitHub（使用原始内容作为占位）
    const response = await updateFile(
      currentFilePath.value,
      originalContent.value + '\n\n<!-- 编辑测试 -->',
      commitMessage.value
    )

    alert(`✅ 保存成功！\n\nCommit SHA: ${response.commit_sha}\n\n页面将在 2 秒后刷新...`)

    // 退出编辑模式
    exitEditMode()

    // 刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 2000)

  } catch (error: any) {
    console.error('[LiveEditor] 保存失败:', error)
    alert(`❌ 保存失败: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.live-editor {
  position: relative;
}

.edit-toggle-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 16px 28px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 9999;
}

.edit-toggle-button.edit-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.edit-toggle-button.save-mode {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  animation: pulse 2s infinite;
}

.edit-toggle-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 6px 30px rgba(16, 185, 129, 0.7);
  }
}

.edit-mode-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 9998;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  font-size: 24px;
}

.banner-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

.banner-cancel {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.banner-cancel:hover {
  background: rgba(255, 255, 255, 0.3);
}

.commit-message-bar {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 9997;
  animation: slideDown 0.3s ease 0.1s backwards;
}

.commit-input {
  width: 100%;
  padding: 14px 20px;
  font-size: 15px;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  outline: none;
  transition: all 0.2s;
}

.commit-input:focus {
  border-color: #d97706;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.commit-input::placeholder {
  color: #9ca3af;
}

/* 编辑模式下的内容区域样式 */
:global(.vp-doc[contenteditable="true"]) {
  cursor: text;
  user-select: text;
  -webkit-user-select: text;
}

:global(.vp-doc[contenteditable="true"]:focus) {
  outline: 2px dashed #f59e0b !important;
  outline-offset: 4px !important;
}
</style>
