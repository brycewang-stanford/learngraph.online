<template>
  <div v-if="isAdminUser" class="page-editor">
    <button @click="toggleEditor" class="edit-page-button" :class="{ editing: isEditing }">
      {{ isEditing ? '💾 保存页面' : '✏️ 编辑页面' }}
    </button>

    <div v-if="isEditing" class="editor-modal">
      <div class="editor-container">
        <div class="editor-header">
          <h3>编辑页面: {{ currentFilePath }}</h3>
          <button @click="closeEditor" class="close-button">✕</button>
        </div>

        <textarea
          v-model="editorContent"
          class="editor-textarea"
          placeholder="编辑 Markdown 内容..."
        ></textarea>

        <div class="editor-footer">
          <input
            v-model="commitMessage"
            type="text"
            placeholder="提交信息（例如：更新文档内容）"
            class="commit-input"
          />
          <div class="button-group">
            <button @click="saveChanges" :disabled="isSaving" class="save-button">
              {{ isSaving ? '保存中...' : '💾 提交到 GitHub' }}
            </button>
            <button @click="closeEditor" class="cancel-button">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { isAdmin, updateFile } from '../utils/github-api'

const route = useRoute()
const isAdminUser = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const editorContent = ref('')
const commitMessage = ref('')
const currentFilePath = ref('')

onMounted(() => {
  isAdminUser.value = isAdmin()
  updateFilePath()
})

watch(() => route.path, () => {
  updateFilePath()
  isEditing.value = false
})

function updateFilePath() {
  // 将 URL 路径转换为文件路径
  let path = route.path

  // 移除前缀
  if (path.startsWith('/langgraph-lightning/')) {
    path = path.replace('/langgraph-lightning/', '')
  } else if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // 转换为 .md 文件路径
  if (path === '' || path === '/') {
    currentFilePath.value = 'docs/index.md'
  } else if (path.endsWith('.html')) {
    currentFilePath.value = `docs/${path.replace('.html', '.md')}`
  } else {
    currentFilePath.value = `docs/${path}.md`
  }
}

async function toggleEditor() {
  if (isEditing.value) {
    await saveChanges()
  } else {
    openEditor()
  }
}

function openEditor() {
  // 获取当前页面的原始 Markdown 内容
  // 这里需要从 GitHub API 获取，或者从页面的特殊数据属性中读取
  const pageContent = document.querySelector('article.vp-doc')?.textContent || ''
  editorContent.value = `# 请从 GitHub 手动复制内容\n\n当前页面路径: ${currentFilePath.value}\n\n页面预览内容:\n${pageContent.substring(0, 500)}...`

  commitMessage.value = `更新页面: ${currentFilePath.value}`
  isEditing.value = true

  // 禁止页面滚动
  document.body.style.overflow = 'hidden'
}

function closeEditor() {
  isEditing.value = false
  document.body.style.overflow = ''
}

async function saveChanges() {
  if (!editorContent.value.trim()) {
    alert('内容不能为空')
    return
  }

  if (!commitMessage.value.trim()) {
    alert('请输入提交信息')
    return
  }

  isSaving.value = true

  try {
    const response = await updateFile(
      currentFilePath.value,
      editorContent.value,
      commitMessage.value
    )

    alert(`✅ 保存成功！\n\n${response.message}\nCommit SHA: ${response.commit_sha}`)

    closeEditor()

    // 3秒后刷新页面以显示新内容
    setTimeout(() => {
      window.location.reload()
    }, 1500)

  } catch (error: any) {
    console.error('保存失败:', error)
    alert(`❌ 保存失败: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.page-editor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.edit-page-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.edit-page-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.edit-page-button.editing {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.editor-container {
  background: var(--vp-c-bg);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-text-1);
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
}

.editor-textarea {
  flex: 1;
  padding: 20px;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-footer {
  padding: 20px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commit-input {
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.commit-input:focus {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.save-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  padding: 10px 20px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-text-2);
}
</style>
