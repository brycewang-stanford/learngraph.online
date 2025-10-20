# OpenAI API Key 配置 🔑

配置 OpenAI API Key，解锁本站所有 LangGraph 代码的一键运行功能。

<script setup>
import { ref, onMounted } from 'vue'

const apiKey = ref('')
const savedKey = ref('')
const message = ref('')
const showKey = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('openai_api_key')
  if (saved) {
    savedKey.value = saved
    apiKey.value = saved
  }
})

function saveApiKey() {
  if (!apiKey.value.trim()) {
    message.value = '❌ 请输入 API Key'
    setTimeout(() => message.value = '', 3000)
    return
  }
  localStorage.setItem('openai_api_key', apiKey.value.trim())
  savedKey.value = apiKey.value.trim()
  message.value = '✅ 保存成功！现在可以运行所有代码示例了'
  setTimeout(() => message.value = '', 3000)
}

function clearApiKey() {
  localStorage.removeItem('openai_api_key')
  apiKey.value = ''
  savedKey.value = ''
  message.value = '🗑️ 已清除'
  setTimeout(() => message.value = '', 3000)
}

function toggleShowKey() {
  showKey.value = !showKey.value
}

function maskKey(key) {
  if (!key) return ''
  if (key.length <= 8) return '***'
  return key.substring(0, 4) + '***' + key.substring(key.length - 4)
}
</script>

## 📝 配置步骤

### 1. 输入 OpenAI API Key

<div style="max-width: 700px; margin: 20px 0; padding: 24px; background: var(--vp-c-bg-soft); border-radius: 8px; border: 2px solid var(--vp-c-divider);">
  <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 15px;">
      🔑 OpenAI API Key
    </label>
    <div style="display: flex; gap: 10px;">
      <input
        v-model="apiKey"
        :type="showKey ? 'text' : 'password'"
        placeholder="sk-proj-..."
        style="flex: 1; padding: 12px 16px; border: 2px solid var(--vp-c-divider); border-radius: 8px; font-family: 'Consolas', monospace; font-size: 14px; background: var(--vp-c-bg); color: var(--vp-c-text-1);"
        @keyup.enter="saveApiKey"
      />
      <button
        @click="toggleShowKey"
        style="padding: 12px 18px; background: var(--vp-c-bg-mute); color: var(--vp-c-text-1); border: 2px solid var(--vp-c-divider); border-radius: 8px; cursor: pointer; font-size: 18px;"
        :title="showKey ? '隐藏' : '显示'"
      >
        {{ showKey ? '🙈' : '👁️' }}
      </button>
    </div>
  </div>

  <div style="display: flex; gap: 12px; margin-bottom: 20px;">
    <button
      @click="saveApiKey"
      style="flex: 1; padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);"
    >
      💾 保存到本地
    </button>
    <button
      @click="clearApiKey"
      style="padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px;"
    >
      🗑️ 清除
    </button>
  </div>

  <div v-if="message" style="padding: 14px 16px; background: var(--vp-c-bg); border-left: 4px solid var(--vp-c-brand); border-radius: 6px; margin-bottom: 20px; font-weight: 500;">
    {{ message }}
  </div>

  <div v-if="savedKey" style="padding: 16px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border-left: 4px solid #10b981;">
    <div style="font-weight: 600; margin-bottom: 8px; color: #065f46; font-size: 15px;">✅ API Key 已保存</div>
    <code style="font-family: 'Consolas', monospace; font-size: 13px; color: #047857; background: #ecfdf5; padding: 6px 10px; border-radius: 4px; display: inline-block;">{{ maskKey(savedKey) }}</code>
    <div style="margin-top: 10px; font-size: 13px; color: #047857;">
      ✨ 现在访问任意教程页面，点击代码块的"运行代码"按钮即可执行！
    </div>
  </div>
  <div v-else style="padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px;">
    <div style="font-weight: 600; color: #92400e; margin-bottom: 6px;">⚠️ 尚未配置 API Key</div>
    <div style="font-size: 13px; color: #78350f;">请先保存 API Key 才能运行代码示例</div>
  </div>
</div>

<div style="max-width: 700px; padding: 16px 20px; background: var(--vp-c-bg-soft); border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
  <div style="font-size: 14px; color: var(--vp-c-text-2); line-height: 1.6;">
    💡 <strong>如何获取 API Key：</strong><br/>
    访问 <a href="https://platform.openai.com/api-keys" target="_blank" style="color: var(--vp-c-brand); font-weight: 600;">OpenAI Platform</a>，登录后在 API Keys 页面创建新的密钥<br/>
    🔒 <strong>安全说明：</strong> API Key 仅保存在您的浏览器本地，不会上传到服务器
  </div>
</div>

---

## ✅ 验证 API Key

保存 API Key 后，运行以下示例验证配置是否成功。

### 示例 1：LangChain 基础调用

最简单的 LangChain 调用，向 GPT-4o-mini 提问：

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
response = llm.invoke("用一句话介绍 LangChain")
print(response.content)
```

### 示例 2：LangGraph 简单图

创建一个最简单的 LangGraph 图，实现问答功能：

```python
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

class State(TypedDict):
    question: str
    answer: str

def answer_node(state: State):
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke(state["question"])
    return {"answer": response.content}

graph = StateGraph(State)
graph.add_node("answer", answer_node)
graph.add_edge(START, "answer")
graph.add_edge("answer", END)

app = graph.compile()
result = app.invoke({"question": "什么是 LangGraph？"})
print(result["answer"])
```

---

## 📚 开始学习

配置完成后，访问教程页面开始学习：

- 🚀 [LangGraph 飞速上手](/module-0/0.0-LangGraph-上手案例)
- 🐍 [Python 基础入门](/module-0/0.1-Python-基础入门)
- 📖 [第 1 章 - 基础概念](/module-1/1.1-simple-graph-最简图)
