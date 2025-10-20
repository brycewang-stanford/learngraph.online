<template>
  <div class="enhanced-code-block" ref="codeBlockContainer">
    <!-- 代码块头部工具栏 -->
    <div class="code-header">
      <div class="code-info">
        <span class="language-badge">🐍 Python</span>
      </div>
      <div class="code-actions">
        <button
          @click="toggleEdit"
          class="action-button edit-button"
          :title="isEditing ? '还原代码' : '编辑代码（临时修改）'"
        >
          {{ isEditing ? '↩️ 还原' : '✏️ 编辑' }}
        </button>
        <button
          @click="copyCode"
          class="action-button copy-button"
          :title="copied ? '已复制！' : '复制代码'"
        >
          {{ copied ? '✓ 已复制' : '📋 复制' }}
        </button>
        <button
          @click="runCode"
          :disabled="isRunning"
          class="action-button run-button"
          :title="isRunning ? '代码执行中...' : '点击运行 Python 代码'"
        >
          {{ isRunning ? '⏳ 运行中...' : '▶️ 运行代码' }}
        </button>
        <button
          v-if="output || error"
          @click="clearOutput"
          :disabled="isRunning"
          class="action-button clear-button"
        >
          🗑️ 清空输出
        </button>
      </div>
    </div>

    <!-- 代码展示区 -->
    <div class="code-wrapper" @click="onCodeWrapperClick">
      <pre
        class="code-content"
        :class="{ 'editing': isEditing }"
      >
        <code
          ref="codeElement"
          class="language-python"
          :contenteditable="isEditing"
          @blur="onCodeBlur"
          v-html="highlightedCode"
        ></code>
      </pre>
    </div>

    <!-- 输出区域 -->
    <div v-if="output || error || executionTime !== null" class="output-wrapper">
      <div class="output-header">
        <span class="output-title">📋 输出结果</span>
        <span v-if="executionTime !== null" class="execution-time">
          ⏱️ {{ executionTime }}s
        </span>
      </div>
      <div class="output-content">
        <!-- 错误信息 -->
        <div v-if="error" class="error-output">
          <pre>{{ error }}</pre>
        </div>

        <!-- 正常输出 -->
        <div v-else-if="output" class="normal-output">
          <pre>{{ output }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { executeCode } from '../utils/python-api'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  code: string
  language?: string
}>()

const output = ref('')
const error = ref('')
const isRunning = ref(false)
const executionTime = ref<number | null>(null)
const copied = ref(false)
const isEditing = ref(false)
const editedCode = ref('')
const codeElement = ref<HTMLElement | null>(null)
const highlightedCode = ref('')
const codeBlockContainer = ref<HTMLElement | null>(null)

// 显示的代码：编辑模式下显示编辑后的代码，否则显示原始代码
const displayCode = computed(() => {
  return isEditing.value && editedCode.value ? editedCode.value : props.code
})

// 语法高亮函数
async function highlightCode(code: string) {
  try {
    const html = await codeToHtml(code, {
      lang: 'python',
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      }
    })
    // 只提取 code 标签内的内容
    const match = html.match(/<code[^>]*>([\s\S]*)<\/code>/)
    return match ? match[1] : code
  } catch (err) {
    console.error('Failed to highlight code:', err)
    return code
  }
}

// 处理点击外部区域退出编辑模式
function handleClickOutside(event: MouseEvent) {
  if (!isEditing.value) return

  const target = event.target as Node
  // 如果点击的不是代码块容器内的元素，退出编辑模式
  if (codeBlockContainer.value && !codeBlockContainer.value.contains(target)) {
    exitEditMode()
  }
}

// 退出编辑模式
async function exitEditMode() {
  if (isEditing.value) {
    // 保存编辑后的代码
    if (codeElement.value) {
      editedCode.value = codeElement.value.textContent || ''
    }

    // 更新语法高亮
    if (editedCode.value) {
      highlightedCode.value = await highlightCode(editedCode.value)
    }

    // 退出编辑模式
    isEditing.value = false
  }
}

// 在组件挂载时进行语法高亮
onMounted(async () => {
  highlightedCode.value = await highlightCode(props.code)

  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 编辑时保存内容
function onCodeInput() {
  if (!codeElement.value) return
  // 保存编辑内容
  editedCode.value = codeElement.value.textContent || ''
}

// 检测代码是否需要 OpenAI API Key
function needsOpenAIKey(code: string): boolean {
  const patterns = [
    /from\s+langchain_openai/,
    /from\s+openai/,
    /import\s+openai/,
    /ChatOpenAI/,
    /OpenAI\(/
  ]
  return patterns.some(pattern => pattern.test(code))
}

// 点击代码区域进入编辑模式
function onCodeWrapperClick(event: MouseEvent) {
  // 如果已经在编辑模式，不处理
  if (isEditing.value) return

  // 进入编辑模式
  isEditing.value = true
  editedCode.value = editedCode.value || props.code

  // 等待 DOM 更新后聚焦
  nextTick(() => {
    if (codeElement.value) {
      codeElement.value.focus()

      // 尝试将光标移到点击位置
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(codeElement.value)
        range.collapse(false) // 折叠到末尾
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  })
}

// 切换编辑模式
function toggleEdit() {
  if (isEditing.value) {
    // 退出编辑模式
    exitEditMode()
  } else {
    // 进入编辑模式
    isEditing.value = true
    editedCode.value = editedCode.value || props.code
    nextTick(() => {
      if (codeElement.value) {
        codeElement.value.focus()
      }
    })
  }
}

// 代码失焦时保存编辑内容
function onCodeBlur() {
  if (isEditing.value && codeElement.value) {
    editedCode.value = codeElement.value.textContent || ''
  }
}

// 复制代码
async function copyCode() {
  try {
    const codeToCopy = isEditing.value && editedCode.value ? editedCode.value : props.code
    await navigator.clipboard.writeText(codeToCopy)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

// 运行代码
async function runCode() {
  // 如果在编辑模式，先退出编辑
  if (isEditing.value) {
    await exitEditMode()
  }

  isRunning.value = true
  output.value = ''
  error.value = ''
  executionTime.value = null

  try {
    // 执行代码：优先执行编辑后的代码
    const codeToRun = editedCode.value || props.code
    const result = await executeCode(codeToRun, 30)
    executionTime.value = result.execution_time || null

    if (result.success) {
      output.value = result.output || '✅ 代码执行成功（无输出）'
    } else {
      // 检查是否是 API Key 相关错误
      const errorMsg = result.error || '执行失败'

      // 如果代码需要 OpenAI 但出现认证错误，提示用户配置 API Key
      if (needsOpenAIKey(props.code) &&
          (errorMsg.includes('API key') ||
           errorMsg.includes('authentication') ||
           errorMsg.includes('OPENAI_API_KEY') ||
           errorMsg.includes('401') ||
           errorMsg.includes('Unauthorized'))) {
        error.value = `❌ 需要 OpenAI API Key\n\n${errorMsg}\n\n💡 请访问导航栏的 "⚡ Python 运行器" 页面配置 API Key`
      } else {
        error.value = errorMsg
      }
    }
  } catch (err: any) {
    error.value = err.message || String(err)
  } finally {
    isRunning.value = false
  }
}

// 清空输出
function clearOutput() {
  output.value = ''
  error.value = ''
  executionTime.value = null
}
</script>

<style scoped>
.enhanced-code-block {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
  gap: 12px;
}

.code-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 4px 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 4px;
}

.code-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-button {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.copy-button:hover {
  background: var(--vp-c-bg);
  border-color: #3b82f6;
}

.run-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.run-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.run-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.clear-button {
  background: #ef4444;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #dc2626;
}

.clear-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.edit-button {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.edit-button:hover {
  background: var(--vp-c-bg);
  border-color: #f59e0b;
}

.code-content.editing {
  outline: 2px solid #f59e0b;
  outline-offset: -2px;
}

.code-content code[contenteditable="true"] {
  cursor: text !important;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  caret-color: #10b981;
  outline: none;
}

.code-content code[contenteditable="true"]:focus {
  outline: none;
}

.code-wrapper {
  background: #1e1e1e;
  overflow-x: auto;
  transition: background 0.2s;
  cursor: pointer;
}

.code-wrapper:hover:not(:has(.code-content.editing)) {
  background: #252525;
}

.code-content {
  margin: 0;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
}

.code-content code {
  background: none;
  padding: 0;
  border-radius: 0;
  white-space: pre;
}

.output-wrapper {
  border-top: 1px solid var(--vp-c-divider);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.output-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.execution-time {
  font-family: monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.output-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--vp-c-bg);
}

.normal-output pre,
.error-output pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.normal-output pre {
  color: var(--vp-c-text-1);
}

.error-output {
  background: #fee2e2;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #ef4444;
}

.error-output pre {
  color: #991b1b;
}

/* 暗色主题 */
.dark .error-output {
  background: #7f1d1d;
  border-left-color: #ef4444;
}

.dark .error-output pre {
  color: #fee2e2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .code-header {
    flex-direction: column;
    align-items: stretch;
  }

  .code-actions {
    width: 100%;
    justify-content: stretch;
  }

  .action-button {
    flex: 1;
  }
}
</style>
