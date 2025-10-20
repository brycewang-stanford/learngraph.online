<template>
  <div class="admin-login">
    <button v-if="!isAdminLoggedIn" @click="loginWithGitHub" class="login-button">
      <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      管理员登录
    </button>

    <div v-else class="admin-info">
      <img :src="user?.avatar_url" :alt="user?.name" class="avatar" />
      <span class="username">{{ user?.name || user?.login }}</span>
      <button @click="logout" class="logout-button">登出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authenticateWithGitHub, saveAuthState, clearAuthState, isAdmin, getCurrentUser } from '../utils/github-api'

const isAdminLoggedIn = ref(false)
const user = ref<any>(null)

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID'
const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin

onMounted(() => {
  // 检查是否已登录
  isAdminLoggedIn.value = isAdmin()
  user.value = getCurrentUser()

  // 检查 URL 中是否有授权码（OAuth 回调）
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (code) {
    handleOAuthCallback(code)
  }
})

function loginWithGitHub() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo,user:email`
  window.location.href = githubAuthUrl
}

async function handleOAuthCallback(code: string) {
  try {
    const response = await authenticateWithGitHub(code)

    if (response.is_admin) {
      saveAuthState(response.access_token, response.user, response.is_admin)
      isAdminLoggedIn.value = true
      user.value = response.user

      // 清除 URL 中的 code 参数并刷新页面以显示编辑按钮
      window.history.replaceState({}, document.title, window.location.pathname)
      window.location.reload()
    } else {
      alert('您不是管理员，无法登录。')
    }
  } catch (error: any) {
    console.error('GitHub 登录失败:', error)
    alert(`登录失败: ${error.message}`)
  }
}

function logout() {
  clearAuthState()
  isAdminLoggedIn.value = false
  user.value = null
}
</script>

<style scoped>
.admin-login {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: 15px;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #24292e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button:hover {
  background: #1a1e22;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.github-icon {
  width: 16px;
  height: 16px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-brand);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.logout-button {
  padding: 4px 12px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
  border: 1px solid var(--vp-c-danger);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: var(--vp-c-danger);
  color: white;
}
</style>
