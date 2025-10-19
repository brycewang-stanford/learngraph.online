/**
 * Pyodide 单例管理器
 * 确保 Pyodide 只加载一次，并在应用启动时预加载
 */

interface PyodideInterface {
  runPythonAsync(code: string): Promise<any>
  setStdout(config: { batched: (msg: string) => void }): void
  version: string
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>
  }
}

class PyodideManager {
  private static instance: PyodideManager
  private pyodide: PyodideInterface | null = null
  private loadingPromise: Promise<PyodideInterface> | null = null
  private isScriptLoaded = false
  private loadStartTime: number = 0
  private listeners: Array<(status: LoadingStatus) => void> = []

  private constructor() {}

  static getInstance(): PyodideManager {
    if (!PyodideManager.instance) {
      PyodideManager.instance = new PyodideManager()
    }
    return PyodideManager.instance
  }

  /**
   * 添加加载状态监听器
   */
  addListener(callback: (status: LoadingStatus) => void) {
    this.listeners.push(callback)
  }

  /**
   * 移除加载状态监听器
   */
  removeListener(callback: (status: LoadingStatus) => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(status: LoadingStatus) {
    this.listeners.forEach(callback => callback(status))
  }

  /**
   * 加载 Pyodide script
   */
  private async loadScript(): Promise<void> {
    if (this.isScriptLoaded) {
      return
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
      script.async = true

      script.onload = () => {
        this.isScriptLoaded = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load Pyodide script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * 初始化 Pyodide
   */
  async initialize(): Promise<PyodideInterface> {
    // 如果已经加载完成，直接返回
    if (this.pyodide) {
      return this.pyodide
    }

    // 如果正在加载，返回加载中的 Promise
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // 开始新的加载流程
    this.loadStartTime = Date.now()
    this.notifyListeners({ status: 'loading', progress: 0, message: '正在加载 Pyodide...' })

    this.loadingPromise = this.doInitialize()

    try {
      this.pyodide = await this.loadingPromise
      const loadTime = ((Date.now() - this.loadStartTime) / 1000).toFixed(2)
      this.notifyListeners({
        status: 'ready',
        progress: 100,
        message: `Pyodide 加载完成 (${loadTime}s)`
      })
      return this.pyodide
    } catch (error) {
      this.loadingPromise = null
      this.notifyListeners({
        status: 'error',
        progress: 0,
        message: `加载失败: ${error}`
      })
      throw error
    }
  }

  /**
   * 执行实际的初始化
   */
  private async doInitialize(): Promise<PyodideInterface> {
    try {
      // 第一步: 加载 script (30%)
      this.notifyListeners({ status: 'loading', progress: 10, message: '下载 Pyodide 脚本...' })
      await this.loadScript()

      this.notifyListeners({ status: 'loading', progress: 30, message: '初始化 Python 运行环境...' })

      // 第二步: 初始化 Pyodide (70%)
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      })

      this.notifyListeners({ status: 'loading', progress: 90, message: '准备就绪...' })

      console.log('✅ Pyodide loaded successfully, Python version:', pyodide.version)

      return pyodide
    } catch (error) {
      console.error('❌ Failed to initialize Pyodide:', error)
      throw error
    }
  }

  /**
   * 获取 Pyodide 实例（如果未加载则等待）
   */
  async getPyodide(): Promise<PyodideInterface> {
    return this.initialize()
  }

  /**
   * 检查是否已准备好
   */
  isReady(): boolean {
    return this.pyodide !== null
  }

  /**
   * 获取加载状态
   */
  getStatus(): 'idle' | 'loading' | 'ready' | 'error' {
    if (this.pyodide) return 'ready'
    if (this.loadingPromise) return 'loading'
    return 'idle'
  }
}

export interface LoadingStatus {
  status: 'idle' | 'loading' | 'ready' | 'error'
  progress: number
  message: string
}

// 导出单例实例
export const pyodideManager = PyodideManager.getInstance()

// 导出类型
export type { PyodideInterface }
