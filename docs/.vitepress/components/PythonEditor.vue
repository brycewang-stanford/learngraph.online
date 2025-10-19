<template>
  <div class="python-editor-container">
    <!-- 编辑器区域 -->
    <div class="editor-wrapper">
      <div class="editor-header">
        <span class="editor-title">🐍 Python 代码编辑器</span>
        <div class="editor-actions">
          <button
            @click="runCode"
            :disabled="isRunning || isLoadingPyodide"
            class="run-button"
          >
            <span v-if="isLoadingPyodide">⏳ 加载中...</span>
            <span v-else-if="isRunning">⏳ 运行中...</span>
            <span v-else>▶️ 运行代码</span>
          </button>
          <button
            @click="clearOutput"
            class="clear-button"
            :disabled="isRunning"
          >
            🗑️ 清空输出
          </button>
        </div>
      </div>

      <!-- Monaco Editor 容器 -->
      <div ref="editorContainer" class="monaco-editor-container"></div>
    </div>

    <!-- 输出区域 -->
    <div class="output-wrapper" v-if="output.length > 0 || error">
      <div class="output-header">
        <span class="output-title">📋 输出结果</span>
      </div>
      <div class="output-content">
        <!-- 错误信息 -->
        <div v-if="error" class="error-output">
          <pre>{{ error }}</pre>
        </div>

        <!-- 正常输出 -->
        <div v-else class="normal-output">
          <div v-for="(line, index) in output" :key="index" class="output-line">
            {{ line }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pyodide 加载提示 -->
    <div v-if="pyodideLoadError" class="pyodide-error">
      <p>❌ Pyodide 加载失败: {{ pyodideLoadError }}</p>
      <button @click="loadPyodide">🔄 重新加载</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'

// Props
const props = defineProps<{
  initialCode?: string
  height?: string
  editable?: boolean
}>()

// Reactive state
const editorContainer = ref<HTMLDivElement>()
const editor = ref<Monaco.editor.IStandaloneCodeEditor>()
const output = ref<string[]>([])
const error = ref<string>('')
const isRunning = ref(false)
const isLoadingPyodide = ref(true)
const pyodideLoadError = ref<string>('')

// Pyodide instance
let pyodide: any = null

// 默认代码
const defaultCode = `# 欢迎使用 Python 在线编辑器！
# 编辑代码后点击"运行代码"按钮查看结果

print("Hello, LangGraph!")

# 示例：基础运算
x = 10
y = 20
print(f"x + y = {x + y}")

# 示例：列表操作
fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(f"I like {fruit}")
`

// 初始化 Monaco Editor
const initMonaco = async () => {
  if (!editorContainer.value) return

  try {
    const monaco = await loader.init()

    // 配置 Monaco Editor
    editor.value = monaco.editor.create(editorContainer.value, {
      value: props.initialCode || defaultCode,
      language: 'python',
      theme: 'vs-dark',
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: props.editable === false,
      minimap: { enabled: false },
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
    })

    // 添加快捷键：Ctrl/Cmd + Enter 运行代码
    editor.value.addAction({
      id: 'run-python-code',
      label: 'Run Python Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        runCode()
      },
    })
  } catch (err) {
    console.error('Monaco Editor 初始化失败:', err)
    error.value = `编辑器初始化失败: ${err}`
  }
}

// 加载 Pyodide
const loadPyodide = async () => {
  isLoadingPyodide.value = true
  pyodideLoadError.value = ''

  try {
    // 从 CDN 加载 Pyodide
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
    script.async = true

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Pyodide script 加载失败'))
      document.head.appendChild(script)
    })

    // 初始化 Pyodide
    // @ts-ignore
    pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    })

    console.log('✅ Pyodide 加载成功, Python 版本:', pyodide.version)
    isLoadingPyodide.value = false
  } catch (err) {
    console.error('❌ Pyodide 加载失败:', err)
    pyodideLoadError.value = `${err}`
    isLoadingPyodide.value = false
  }
}

// 运行 Python 代码
const runCode = async () => {
  if (!editor.value || !pyodide) {
    error.value = 'Editor 或 Pyodide 未初始化'
    return
  }

  if (isLoadingPyodide.value) {
    error.value = 'Pyodide 正在加载中，请稍候...'
    return
  }

  isRunning.value = true
  output.value = []
  error.value = ''

  try {
    const code = editor.value.getValue()

    // 捕获 print 输出
    const capturedOutput: string[] = []
    pyodide.setStdout({
      batched: (msg: string) => {
        capturedOutput.push(msg)
      },
    })

    // 执行代码
    await pyodide.runPythonAsync(code)

    // 设置输出
    output.value = capturedOutput

    // 如果没有输出，显示成功消息
    if (capturedOutput.length === 0) {
      output.value = ['✅ 代码执行成功（无输出）']
    }
  } catch (err: any) {
    console.error('Python 执行错误:', err)
    error.value = err.message || String(err)
  } finally {
    isRunning.value = false
  }
}

// 清空输出
const clearOutput = () => {
  output.value = []
  error.value = ''
}

// 获取当前代码
const getCode = () => {
  return editor.value?.getValue() || ''
}

// 设置代码
const setCode = (code: string) => {
  editor.value?.setValue(code)
}

// 暴露方法给父组件
defineExpose({
  getCode,
  setCode,
  runCode,
  clearOutput,
})

// 生命周期
onMounted(async () => {
  await initMonaco()
  await loadPyodide()
})

onBeforeUnmount(() => {
  editor.value?.dispose()
})

// 监听 initialCode 变化
watch(() => props.initialCode, (newCode) => {
  if (newCode && editor.value) {
    editor.value.setValue(newCode)
  }
})
</script>

<style scoped>
.python-editor-container {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.editor-wrapper {
  background: #1e1e1e;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
}

.editor-title {
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.run-button,
.clear-button {
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
  transform: translateY(-1px);
}

.run-button:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.clear-button {
  background: #f44336;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-1px);
}

.clear-button:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.monaco-editor-container {
  height: 400px;
  width: 100%;
}

.output-wrapper {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.output-header {
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.output-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.output-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.error-output {
  color: #f44336;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  background: #ffebee;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.error-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.normal-output {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.output-line {
  padding: 4px 0;
  border-bottom: 1px solid var(--vp-c-divider-light);
}

.output-line:last-child {
  border-bottom: none;
}

.pyodide-error {
  padding: 16px;
  background: #ffebee;
  border-top: 1px solid var(--vp-c-divider);
  color: #f44336;
  text-align: center;
}

.pyodide-error button {
  margin-top: 8px;
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.pyodide-error button:hover {
  background: #da190b;
}

/* 暗色主题适配 */
.dark .error-output {
  background: #3d1e1e;
  color: #ff6b6b;
}

.dark .pyodide-error {
  background: #3d1e1e;
  color: #ff6b6b;
}
</style>
