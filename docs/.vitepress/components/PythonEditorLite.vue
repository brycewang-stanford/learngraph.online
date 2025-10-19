<template>
  <div class="python-editor-lite">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <span class="editor-title">🐍 Python 代码编辑器（轻量版）</span>
      <div class="editor-actions">
        <button @click="runCode" :disabled="isRunning" class="run-button">
          {{ isRunning ? '⏳ 运行中...' : '▶️ 运行代码' }}
        </button>
        <button @click="clearOutput" :disabled="isRunning" class="clear-button">
          🗑️ 清空
        </button>
      </div>
    </div>

    <!-- 代码编辑区 -->
    <textarea
      v-model="code"
      class="code-editor"
      spellcheck="false"
      :readonly="isRunning"
      @keydown="handleKeydown"
    ></textarea>

    <!-- 输出区域 -->
    <div v-if="output || error || executionTime !== null" class="output-wrapper">
      <div class="output-header">
        <span>📋 输出结果</span>
        <span v-if="executionTime !== null" class="time">⏱️ {{ executionTime }}s</span>
      </div>
      <div class="output-content">
        <pre v-if="error" class="error">{{ error }}</pre>
        <pre v-else class="success">{{ output }}</pre>
      </div>
    </div>

    <!-- API 错误提示 -->
    <div v-if="apiError" class="api-error">
      <p>❌ {{ apiError }}</p>
      <small>请确保 FastAPI 服务运行在 http://localhost:8000</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { executeCode } from '../utils/python-api'

const props = defineProps<{
  initialCode?: string
}>()

const code = ref(props.initialCode || `# Python 在线编辑器
print("Hello, FastAPI!")

# 快捷键：Ctrl/Cmd + Enter 运行代码
x = 10
y = 20
print(f"{x} + {y} = {x + y}")`)

const output = ref('')
const error = ref('')
const isRunning = ref(false)
const executionTime = ref<number | null>(null)
const apiError = ref('')

// 运行代码
const runCode = async () => {
  isRunning.value = true
  output.value = ''
  error.value = ''
  apiError.value = ''
  executionTime.value = null

  try {
    const result = await executeCode(code.value, 10)
    executionTime.value = result.execution_time || null

    if (result.success) {
      output.value = result.output || '✅ 执行成功（无输出）'
    } else {
      error.value = result.error || '执行失败'
      if (result.error?.includes('网络') || result.error?.includes('Failed')) {
        apiError.value = result.error
      }
    }
  } catch (err: any) {
    error.value = err.message || String(err)
  } finally {
    isRunning.value = false
  }
}

// 清空输出
const clearOutput = () => {
  output.value = ''
  error.value = ''
  apiError.value = ''
  executionTime.value = null
}

// 快捷键支持
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + Enter 运行
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    runCode()
  }

  // Tab 键插入空格
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = e.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    code.value = code.value.substring(0, start) + '    ' + code.value.substring(end)
    // 恢复光标位置
    setTimeout(() => {
      textarea.setSelectionRange(start + 4, start + 4)
    })
  }
}

defineExpose({ runCode, clearOutput })
</script>

<style scoped>
.python-editor-lite {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.editor-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.editor-actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.run-button {
  background: #4caf50;
  color: white;
}

.run-button:hover:not(:disabled) {
  background: #45a049;
}

.run-button:disabled {
  background: #999;
  cursor: not-allowed;
}

.clear-button {
  background: #f44336;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #da190b;
}

.clear-button:disabled {
  background: #999;
  cursor: not-allowed;
}

.code-editor {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: #1e1e1e;
  color: #d4d4d4;
  resize: vertical;
  outline: none;
}

.code-editor:focus {
  background: #252525;
}

.output-wrapper {
  border-top: 1px solid var(--vp-c-divider);
}

.output-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.time {
  font-family: monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.output-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--vp-c-bg);
}

pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error {
  color: #f44336;
  background: #ffebee;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.success {
  color: var(--vp-c-text-1);
}

.api-error {
  padding: 16px;
  background: #fff3cd;
  border-top: 1px solid var(--vp-c-divider);
  color: #856404;
  text-align: center;
}

.api-error small {
  display: block;
  margin-top: 8px;
  font-size: 12px;
}

/* 暗色主题 */
.dark .error {
  background: #3d1e1e;
  color: #ff6b6b;
}

.dark .api-error {
  background: #4a3f2e;
  color: #ffc107;
}
</style>
