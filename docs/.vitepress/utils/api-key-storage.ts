/**
 * API Key 本地存储管理
 *
 * 安全声明：
 * - 所有 API Key 仅存储在用户浏览器的 localStorage 中
 * - 网站不会上传、收集或存储任何用户的 API Key
 * - 用户可以随时删除本地存储的 API Key
 */

const STORAGE_PREFIX = 'langgraph_api_'

export interface ApiKeyConfig {
  openai?: string
  anthropic?: string
}

/**
 * 保存 API Key 到 localStorage
 */
export function saveApiKey(provider: 'openai' | 'anthropic', key: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${provider}`, key)
    console.log(`[API Key] ${provider} key saved locally (browser only)`)
  } catch (error) {
    console.error(`[API Key] Failed to save ${provider} key:`, error)
    throw new Error('无法保存 API Key，请检查浏览器设置')
  }
}

/**
 * 获取 API Key
 */
export function getApiKey(provider: 'openai' | 'anthropic'): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${provider}`)
  } catch (error) {
    console.error(`[API Key] Failed to get ${provider} key:`, error)
    return null
  }
}

/**
 * 删除 API Key
 */
export function deleteApiKey(provider: 'openai' | 'anthropic'): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${provider}`)
    console.log(`[API Key] ${provider} key deleted`)
  } catch (error) {
    console.error(`[API Key] Failed to delete ${provider} key:`, error)
  }
}

/**
 * 获取所有 API Key
 */
export function getAllApiKeys(): ApiKeyConfig {
  return {
    openai: getApiKey('openai') || undefined,
    anthropic: getApiKey('anthropic') || undefined,
  }
}

/**
 * 清空所有 API Key
 */
export function clearAllApiKeys(): void {
  deleteApiKey('openai')
  deleteApiKey('anthropic')
  console.log('[API Key] All keys cleared')
}

/**
 * 检查是否有 API Key
 */
export function hasApiKey(provider: 'openai' | 'anthropic'): boolean {
  const key = getApiKey(provider)
  return key !== null && key.trim().length > 0
}

/**
 * 验证 API Key 格式
 */
export function validateApiKey(provider: 'openai' | 'anthropic', key: string): boolean {
  if (!key || key.trim().length === 0) {
    return false
  }

  // 基础格式验证
  if (provider === 'openai') {
    // OpenAI key 通常以 sk- 开头
    return key.startsWith('sk-') && key.length > 20
  } else if (provider === 'anthropic') {
    // Anthropic key 通常以 sk-ant- 开头
    return key.startsWith('sk-ant-') && key.length > 20
  }

  return false
}

/**
 * 检测代码是否需要 API Key
 */
export function detectRequiredApiKeys(code: string): {
  needsOpenAI: boolean
  needsAnthropic: boolean
} {
  const upperCode = code.toUpperCase()

  return {
    needsOpenAI:
      upperCode.includes('OPENAI_API_KEY') ||
      upperCode.includes('OPENAI') ||
      upperCode.includes('GPT-') ||
      upperCode.includes('CHATOPENAI'),
    needsAnthropic:
      upperCode.includes('ANTHROPIC_API_KEY') ||
      upperCode.includes('ANTHROPIC') ||
      upperCode.includes('CLAUDE') ||
      upperCode.includes('CHATANTHROPIC')
  }
}

/**
 * 将 API Key 注入到代码中
 */
export function injectApiKeys(code: string, keys: ApiKeyConfig): string {
  let modifiedCode = code

  // 注入 OpenAI API Key
  if (keys.openai) {
    // 替换 os.environ.get("OPENAI_API_KEY")
    modifiedCode = modifiedCode.replace(
      /os\.environ\.get\s*\(\s*["']OPENAI_API_KEY["']\s*\)/g,
      `"${keys.openai}"`
    )
    // 替换 os.getenv("OPENAI_API_KEY")
    modifiedCode = modifiedCode.replace(
      /os\.getenv\s*\(\s*["']OPENAI_API_KEY["']\s*\)/g,
      `"${keys.openai}"`
    )
    // 替换 getpass("OPENAI_API_KEY")
    modifiedCode = modifiedCode.replace(
      /getpass\s*\(\s*["'].*?OPENAI.*?["']\s*\)/g,
      `"${keys.openai}"`
    )
  }

  // 注入 Anthropic API Key
  if (keys.anthropic) {
    modifiedCode = modifiedCode.replace(
      /os\.environ\.get\s*\(\s*["']ANTHROPIC_API_KEY["']\s*\)/g,
      `"${keys.anthropic}"`
    )
    modifiedCode = modifiedCode.replace(
      /os\.getenv\s*\(\s*["']ANTHROPIC_API_KEY["']\s*\)/g,
      `"${keys.anthropic}"`
    )
    modifiedCode = modifiedCode.replace(
      /getpass\s*\(\s*["'].*?ANTHROPIC.*?["']\s*\)/g,
      `"${keys.anthropic}"`
    )
  }

  return modifiedCode
}
