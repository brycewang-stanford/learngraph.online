/**
 * GitHub 认证和文件编辑 API
 * 仅限管理员使用
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface GitHubUser {
  login: string
  email: string
  name: string
  avatar_url: string
}

export interface GitHubAuthResponse {
  access_token: string
  user: GitHubUser
  is_admin: boolean
}

export interface FileUpdateRequest {
  file_path: string
  content: string
  commit_message: string
}

export interface FileUpdateResponse {
  success: boolean
  message: string
  commit_sha?: string
}

/**
 * 使用 GitHub 授权码进行认证
 */
export async function authenticateWithGitHub(code: string): Promise<GitHubAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/github`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'GitHub 认证失败')
  }

  return response.json()
}

/**
 * 更新 GitHub 仓库中的文件
 */
export async function updateFile(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<FileUpdateResponse> {
  const token = localStorage.getItem('github_token')

  if (!token) {
    throw new Error('未登录：请先登录 GitHub')
  }

  const response = await fetch(`${API_BASE_URL}/github/update-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      file_path: filePath,
      content,
      commit_message: commitMessage,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || '文件更新失败')
  }

  return response.json()
}

/**
 * 获取 GitHub 仓库中的文件内容
 */
export async function getFile(filePath: string): Promise<string> {
  const token = localStorage.getItem('github_token')

  if (!token) {
    throw new Error('未登录：请先登录 GitHub')
  }

  const response = await fetch(`${API_BASE_URL}/github/file/${filePath}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || '获取文件失败')
  }

  const data = await response.json()
  return data.content
}

/**
 * 保存登录状态到 localStorage
 */
export function saveAuthState(token: string, user: GitHubUser, isAdmin: boolean) {
  localStorage.setItem('github_token', token)
  localStorage.setItem('github_user', JSON.stringify(user))
  localStorage.setItem('is_admin', isAdmin.toString())
}

/**
 * 清除登录状态
 */
export function clearAuthState() {
  localStorage.removeItem('github_token')
  localStorage.removeItem('github_user')
  localStorage.removeItem('is_admin')
}

/**
 * 检查是否已登录且为管理员
 */
export function isAdmin(): boolean {
  const isAdminStr = localStorage.getItem('is_admin')
  return isAdminStr === 'true'
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): GitHubUser | null {
  const userStr = localStorage.getItem('github_user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
