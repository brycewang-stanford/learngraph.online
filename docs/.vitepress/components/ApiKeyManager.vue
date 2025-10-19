<template>
  <div class="api-key-manager">
    <!-- API Key 配置按钮 -->
    <button @click="showModal = true" class="config-button" title="配置 API Keys">
      🔑 API Keys
    </button>

    <!-- API Key 配置弹窗 -->
    <teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>🔑 API Key 配置</h3>
            <button @click="showModal = false" class="close-button">✕</button>
          </div>

          <div class="privacy-notice">
            <p>🔒 <strong>隐私声明</strong></p>
            <p>所有 API Key 仅保存在您的浏览器本地存储（localStorage）中</p>
            <p>本网站<strong>不会上传、收集或存储</strong>任何您的 API Key</p>
          </div>

          <div class="api-key-form">
            <!-- OpenAI API Key -->
            <div class="form-group">
              <label>
                <span class="label-text">OpenAI API Key</span>
                <span v-if="hasOpenAI" class="status-badge">已配置 ✓</span>
              </label>
              <div class="input-group">
                <input
                  v-model="tempOpenAI"
                  :type="showOpenAI ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="api-key-input"
                />
                <button @click="showOpenAI = !showOpenAI" class="toggle-button">
                  {{ showOpenAI ? '🙈' : '👁️' }}
                </button>
              </div>
              <small class="hint">用于 ChatGPT、GPT-4 等 OpenAI 模型</small>
            </div>

            <!-- Anthropic API Key -->
            <div class="form-group">
              <label>
                <span class="label-text">Anthropic API Key</span>
                <span v-if="hasAnthropic" class="status-badge">已配置 ✓</span>
              </label>
              <div class="input-group">
                <input
                  v-model="tempAnthropic"
                  :type="showAnthropic ? 'text' : 'password'"
                  placeholder="sk-ant-..."
                  class="api-key-input"
                />
                <button @click="showAnthropic = !showAnthropic" class="toggle-button">
                  {{ showAnthropic ? '🙈' : '👁️' }}
                </button>
              </div>
              <small class="hint">用于 Claude 等 Anthropic 模型</small>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="saveKeys" class="save-button">💾 保存</button>
            <button @click="clearKeys" class="clear-button">🗑️ 清空所有</button>
            <button @click="showModal = false" class="cancel-button">取消</button>
          </div>

          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  saveApiKey,
  getApiKey,
  clearAllApiKeys,
  hasApiKey,
  validateApiKey
} from '../utils/api-key-storage'

const showModal = ref(false)
const tempOpenAI = ref('')
const tempAnthropic = ref('')
const showOpenAI = ref(false)
const showAnthropic = ref(false)
const hasOpenAI = ref(false)
const hasAnthropic = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 加载现有 API Keys
onMounted(() => {
  loadKeys()
})

function loadKeys() {
  tempOpenAI.value = getApiKey('openai') || ''
  tempAnthropic.value = getApiKey('anthropic') || ''
  hasOpenAI.value = hasApiKey('openai')
  hasAnthropic.value = hasApiKey('anthropic')
}

function saveKeys() {
  message.value = ''

  try {
    // 保存 OpenAI Key
    if (tempOpenAI.value.trim()) {
      if (!validateApiKey('openai', tempOpenAI.value)) {
        message.value = '❌ OpenAI API Key 格式不正确（应以 sk- 开头）'
        messageType.value = 'error'
        return
      }
      saveApiKey('openai', tempOpenAI.value.trim())
    }

    // 保存 Anthropic Key
    if (tempAnthropic.value.trim()) {
      if (!validateApiKey('anthropic', tempAnthropic.value)) {
        message.value = '❌ Anthropic API Key 格式不正确（应以 sk-ant- 开头）'
        messageType.value = 'error'
        return
      }
      saveApiKey('anthropic', tempAnthropic.value.trim())
    }

    message.value = '✅ API Keys 已保存到浏览器本地'
    messageType.value = 'success'
    loadKeys()

    // 2 秒后关闭弹窗
    setTimeout(() => {
      showModal.value = false
      message.value = ''
    }, 2000)

  } catch (error) {
    message.value = `❌ 保存失败: ${error}`
    messageType.value = 'error'
  }
}

function clearKeys() {
  if (confirm('确定要清空所有 API Keys 吗？')) {
    clearAllApiKeys()
    tempOpenAI.value = ''
    tempAnthropic.value = ''
    hasOpenAI.value = false
    hasAnthropic.value = false
    message.value = '✅ 已清空所有 API Keys'
    messageType.value = 'success'
  }
}
</script>

<style scoped>
.api-key-manager {
  display: inline-block;
}

.config-button {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.config-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--vp-c-divider);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--vp-c-divider);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--vp-c-text-1);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.privacy-notice {
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 8px;
}

.privacy-notice p {
  margin: 4px 0;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
}

.privacy-notice strong {
  font-weight: 600;
}

.api-key-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.label-text {
  font-size: 14px;
}

.status-badge {
  font-size: 12px;
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.api-key-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.api-key-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.toggle-button {
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.toggle-button:hover {
  background: var(--vp-c-bg);
}

.hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.save-button {
  background: #10b981;
  color: white;
}

.save-button:hover {
  background: #059669;
}

.clear-button {
  background: #ef4444;
  color: white;
}

.clear-button:hover {
  background: #dc2626;
}

.cancel-button {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.cancel-button:hover {
  background: var(--vp-c-bg);
}

.message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

/* 暗色主题 */
.dark .privacy-notice {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.dark .privacy-notice p {
  color: #dbeafe;
}

.dark .message.success {
  background: #064e3b;
  color: #d1fae5;
}

.dark .message.error {
  background: #7f1d1d;
  color: #fee2e2;
}
</style>
