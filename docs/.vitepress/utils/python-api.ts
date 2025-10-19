/**
 * Python 代码执行 API 客户端
 * 与 FastAPI 后端通信
 */

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ExecuteCodeRequest {
  code: string
  timeout?: number
}

export interface ExecuteCodeResponse {
  success: boolean
  output?: string
  error?: string
  execution_time?: number
}

/**
 * 执行 Python 代码
 */
export async function executeCode(code: string, timeout: number = 10): Promise<ExecuteCodeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        timeout,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: ExecuteCodeResponse = await response.json()
    return data

  } catch (error) {
    console.error('Failed to execute code:', error)

    // 返回错误响应
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败，请检查后端服务是否运行',
    }
  }
}

/**
 * 使用 Docker 沙箱执行代码（更安全）
 */
export async function executeCodeDocker(code: string, timeout: number = 10): Promise<ExecuteCodeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/execute-docker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        timeout,
      }),
    })

    if (!response.ok) {
      // 如果 Docker 不可用，降级到普通执行
      if (response.status === 500) {
        console.warn('Docker not available, falling back to regular execution')
        return executeCode(code, timeout)
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: ExecuteCodeResponse = await response.json()
    return data

  } catch (error) {
    console.error('Failed to execute code with Docker:', error)
    // 降级到普通执行
    return executeCode(code, timeout)
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
