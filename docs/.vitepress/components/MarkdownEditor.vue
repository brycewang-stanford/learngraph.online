<template>
  <div v-if="isAdminUser" class="markdown-editor-wrapper">
    <!-- 编辑按钮 -->
    <button
      v-if="!isEditing"
      @click="enterEditMode"
      class="edit-button"
      :disabled="isLoading"
      title="编辑此页"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      <span>{{ isLoading ? '加载中...' : '编辑此页' }}</span>
    </button>

    <!-- 全屏编辑器 -->
    <div v-if="isEditing" class="editor-fullscreen">
      <!-- 顶部工具栏 -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <h3 class="file-path">📄 {{ currentFilePath }}</h3>
        </div>
        <div class="toolbar-right">
          <input
            v-model="commitMessage"
            type="text"
            placeholder="提交信息（例如：更新首页内容）"
            class="commit-input"
            @keyup.enter="saveToGitHub"
          />
          <button
            @click="saveToGitHub"
            :disabled="isSaving || !commitMessage.trim()"
            class="save-button"
          >
            {{ isSaving ? '⏳ 保存中...' : '💾 保存到 GitHub' }}
          </button>
          <button @click="exitEditMode" class="cancel-button">
            ❌ 取消
          </button>
        </div>
      </div>

      <!-- Markdown 编辑器 (简化版：使用 textarea) -->
      <div class="editor-container">
        <textarea
          v-model="editorContent"
          class="markdown-textarea"
          spellcheck="false"
          placeholder="加载 Markdown 内容中..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vitepress'
import { isAdmin, updateFile, getFile } from '../utils/github-api'
import { loader } from '@monaco-editor/react'

// 动态导入 Monaco Editor
const MonacoEditor = shallowRef<any>(null)

const route = useRoute()
const isAdminUser = ref(false)
const isEditing = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const editorContent = ref('')
const commitMessage = ref('')
const currentFilePath = ref('')

const editorOptions = {
  fontSize: 14,
  minimap: { enabled: true },
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  tabSize: 2,
}

onMounted(async () => {
  isAdminUser.value = isAdmin()

  if (isAdminUser.value) {
    // 动态加载 Monaco Editor 组件
    try {
      const { default: Editor } = await import('@monaco-editor/react')
      MonacoEditor.value = Editor
      console.log('[MarkdownEditor] Monaco Editor loaded successfully')
    } catch (error) {
      console.error('[MarkdownEditor] Failed to load Monaco Editor:', error)
    }
  }
})

function handleEditorChange(value: string | undefined) {
  if (value !== undefined) {
    editorContent.value = value
  }
}

function getFilePath(): string {
  let path = route.path

  // 移除 base 前缀
  if (path.startsWith('/langgraph-lightning/')) {
    path = path.replace('/langgraph-lightning/', '')
  } else if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // URL 解码：将 %E5%9F%BA%E7%A1%80 解码为中文字符
  path = decodeURIComponent(path)

  // 转换为 .md 文件路径
  // 注意：文件在项目根目录，不在 docs/ 文件夹下
  if (path === '' || path === '/') {
    return 'index.md'
  } else if (path.endsWith('.html')) {
    return `${path.replace('.html', '.md')}`
  } else {
    return `${path}.md`
  }
}

async function enterEditMode() {
  currentFilePath.value = getFilePath()
  isLoading.value = true

  try {
    console.log('[MarkdownEditor] 获取文件:', currentFilePath.value)

    // 从 GitHub 获取原始 Markdown 内容
    const content = await getFile(currentFilePath.value)

    console.log('[MarkdownEditor] 文件内容长度:', content.length)
    console.log('[MarkdownEditor] 文件内容预览:', content.substring(0, 200))

    editorContent.value = content
    commitMessage.value = `更新: ${currentFilePath.value}`

    // 进入编辑模式
    isEditing.value = true

    // 禁止页面滚动
    document.body.style.overflow = 'hidden'

    console.log('[MarkdownEditor] 编辑模式已激活')
    console.log('[MarkdownEditor] editorContent.value 长度:', editorContent.value.length)
  } catch (error: any) {
    console.error('[MarkdownEditor] 获取文件失败:', error)
    alert(`❌ 无法进入编辑模式: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

function exitEditMode() {
  if (editorContent.value && confirm('确定要退出编辑吗？未保存的修改将丢失。')) {
    isEditing.value = false
    editorContent.value = ''
    document.body.style.overflow = ''
  } else if (!editorContent.value) {
    isEditing.value = false
    document.body.style.overflow = ''
  }
}

async function saveToGitHub() {
  if (!commitMessage.value.trim()) {
    alert('❌ 请输入提交信息')
    return
  }

  if (!editorContent.value.trim()) {
    alert('❌ 内容不能为空')
    return
  }

  isSaving.value = true

  try {
    console.log('[MarkdownEditor] 保存到 GitHub:', currentFilePath.value)

    const response = await updateFile(
      currentFilePath.value,
      editorContent.value,
      commitMessage.value
    )

    alert(`✅ 保存成功！\n\nCommit SHA: ${response.commit_sha}\n\n页面将在 2 秒后刷新...`)

    // 退出编辑模式
    isEditing.value = false
    document.body.style.overflow = ''

    // 刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 2000)

  } catch (error: any) {
    console.error('[MarkdownEditor] 保存失败:', error)
    alert(`❌ 保存失败: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.markdown-editor-wrapper {
  position: relative;
}

.edit-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 500;
  font-size: 14px;

  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;

  cursor: pointer;
}

.edit-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
}

.edit-button:active:not(:disabled) {
  transform: translateY(0);
}

.edit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-button svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .edit-button {
    right: 16px;
    bottom: 16px;
    padding: 10px 16px;
    font-size: 13px;
  }

  .edit-button svg {
    width: 18px;
    height: 18px;
  }
}

/* 超小屏幕只显示图标 */
@media (max-width: 480px) {
  .edit-button span {
    display: none;
  }

  .edit-button {
    padding: 12px;
    border-radius: 50%;
  }
}

/* 暗色模式适配 */
.dark .edit-button {
  background: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.dark .edit-button:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.editor-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1e1e1e;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  gap: 20px;
}

.toolbar-left {
  flex: 0 0 auto;
}

.file-path {
  margin: 0;
  font-size: 15px;
  color: #cccccc;
  font-weight: 500;
}

.toolbar-right {
  flex: 1;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
}

.commit-input {
  flex: 1;
  max-width: 400px;
  padding: 8px 14px;
  font-size: 14px;
  background: #3c3c3c;
  border: 1px solid #555555;
  border-radius: 4px;
  color: #cccccc;
  outline: none;
}

.commit-input:focus {
  border-color: #007acc;
}

.commit-input::placeholder {
  color: #858585;
}

.save-button {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  padding: 8px 16px;
  font-size: 14px;
  background: #3c3c3c;
  color: #cccccc;
  border: 1px solid #555555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #4e4e4e;
  border-color: #666666;
}

.editor-container {
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
}

.markdown-textarea {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  tab-size: 2;
}

.markdown-textarea::placeholder {
  color: #858585;
}

.markdown-textarea:focus {
  outline: none;
}
</style>
