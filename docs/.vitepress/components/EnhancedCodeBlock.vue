<template>
  <div class="enhanced-code-block">
    <!-- 代码块头部工具栏 -->
    <div class="code-header">
      <div class="code-info">
        <span class="language-badge">🐍 Python</span>
        <span v-if="needsApiKeys" class="api-required-badge" title="此代码需要 API Key">
          🔑 需要 API Key
        </span>
      </div>
      <div class="code-actions">
        <ApiKeyManager v-if="needsApiKeys" />
        <button
          @click="copyCode"
          class="action-button copy-button"
          :title="copied ? '已复制！' : '复制代码'"
        >
          {{ copied ? '✓ 已复制' : '📋 复制' }}
        </button>
        <button
          @click="runCode"
          :disabled="isRunning || (needsApiKeys && !hasRequiredKeys)"
          class="action-button run-button"
          :title="getRunButtonTitle()"
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
    <div class="code-wrapper">
      <pre class="code-content"><code class="language-python">{{ code }}</code></pre>
    </div>

    <!-- API Key 缺失提示 -->
    <div v-if="needsApiKeys && !hasRequiredKeys" class="api-key-warning">
      <p>⚠️ 此代码需要 API Key，请点击 <strong>🔑 API Keys</strong> 按钮配置</p>
      <p class="warning-detail">
        需要：
        <span v-if="requiredKeys.openai">OpenAI API Key</span>
        <span v-if="requiredKeys.openai && requiredKeys.anthropic"> 和 </span>
        <span v-if="requiredKeys.anthropic">Anthropic API Key</span>
      </p>
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
import { ref, computed, onMounted } from 'vue'
import ApiKeyManager from './ApiKeyManager.vue'
import { executeCode } from '../utils/python-api'
import {
  getAllApiKeys,
  hasApiKey,
  detectRequiredApiKeys,
  injectApiKeys
} from '../utils/api-key-storage'

const props = defineProps<{
  code: string
  language?: string
}>()

const output = ref('')
const error = ref('')
const isRunning = ref(false)
const executionTime = ref<number | null>(null)
const copied = ref(false)

// 检测代码是否需要 API Key
const requiredKeys = computed(() => detectRequiredApiKeys(props.code))
const needsApiKeys = computed(() => requiredKeys.value.needsOpenAI || requiredKeys.value.needsAnthropic)

// 检查是否有所需的 API Key
const hasRequiredKeys = computed(() => {
  if (requiredKeys.value.needsOpenAI && !hasApiKey('openai')) {
    return false
  }
  if (requiredKeys.value.needsAnthropic && !hasApiKey('anthropic')) {
    return false
  }
  return true
})

function getRunButtonTitle(): string {
  if (isRunning.value) {
    return '代码执行中...'
  }
  if (needsApiKeys.value && !hasRequiredKeys.value) {
    return '请先配置 API Key'
  }
  return '点击运行 Python 代码'
}

// 复制代码
async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
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
  if (needsApiKeys.value && !hasRequiredKeys.value) {
    error.value = '❌ 请先配置 API Key（点击右上角 🔑 API Keys 按钮）'
    return
  }

  isRunning.value = true
  output.value = ''
  error.value = ''
  executionTime.value = null

  try {
    // 获取 API Keys
    const keys = getAllApiKeys()

    // 注入 API Keys 到代码中
    let codeToExecute = props.code
    if (needsApiKeys.value) {
      codeToExecute = injectApiKeys(props.code, keys)
      console.log('[Code Execution] API Keys injected')
    }

    // 执行代码
    const result = await executeCode(codeToExecute, 30)
    executionTime.value = result.execution_time || null

    if (result.success) {
      output.value = result.output || '✅ 代码执行成功（无输出）'
    } else {
      error.value = result.error || '执行失败'
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

.api-required-badge {
  font-size: 12px;
  padding: 3px 8px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

.code-wrapper {
  background: #1e1e1e;
  overflow-x: auto;
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

.api-key-warning {
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.api-key-warning p {
  margin: 4px 0;
  font-size: 14px;
  color: #92400e;
}

.api-key-warning strong {
  font-weight: 600;
}

.warning-detail {
  font-size: 12px !important;
  color: #78350f !important;
  margin-top: 8px !important;
}

.warning-detail span {
  font-weight: 600;
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
.dark .api-key-warning {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
}

.dark .api-key-warning p {
  color: #fef3c7;
}

.dark .warning-detail {
  color: #fde68a !important;
}

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
