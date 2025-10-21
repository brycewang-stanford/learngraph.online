<template>
  <button
    v-if="hasSidebar"
    class="sidebar-toggle-btn"
    @click="toggleSidebar"
    :title="isCollapsed ? '展开目录' : '收起目录'"
  >
    <svg v-if="!isCollapsed" class="icon" viewBox="0 0 24 24">
      <!-- 左箭头图标 - 收起 -->
      <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
    <svg v-else class="icon" viewBox="0 0 24 24">
      <!-- 右箭头图标 - 展开 -->
      <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import { useSidebar } from 'vitepress/theme'

const route = useRoute()
const { hasSidebar } = useSidebar()
const isCollapsed = ref(false)

// 保存/恢复折叠状态
const STORAGE_KEY = 'vitepress-sidebar-collapsed'

onMounted(() => {
  // 从 localStorage 恢复状态
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'true') {
    isCollapsed.value = true
    // 延迟一下确保 DOM 完全加载
    setTimeout(() => applySidebarState(true), 100)
  } else {
    // 确保按钮在正确位置 - 继续右移10px
    const toggleBtn = document.querySelector('.sidebar-toggle-btn')
    if (toggleBtn) {
      toggleBtn.style.left = '380px'
    }
  }
})

// 监听路由变化，确保状态保持
watch(() => route.path, () => {
  if (isCollapsed.value) {
    setTimeout(() => applySidebarState(true), 100)
  }
})

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  applySidebarState(isCollapsed.value)
  // 保存状态
  localStorage.setItem(STORAGE_KEY, isCollapsed.value.toString())
}

function applySidebarState(collapsed) {
  const sidebar = document.querySelector('.VPSidebar')
  const content = document.querySelector('.VPContent')
  const doc = document.querySelector('.VPDoc')
  const toggleBtn = document.querySelector('.sidebar-toggle-btn')

  if (!sidebar) return

  if (collapsed) {
    // 收起侧边栏 - 完全隐藏380px位置的侧边栏（按钮原本在380px）
    sidebar.style.transform = 'translateX(-380px)'
    sidebar.style.transition = 'transform 0.3s ease'

    // 调整内容区域 - 利用全屏宽度，从按钮右边开始
    if (content) {
      content.style.paddingLeft = '24px'
      content.style.transition = 'padding-left 0.3s ease'
    }

    // 调整按钮位置 - 折叠后按钮贴在最左边
    if (toggleBtn) {
      toggleBtn.style.left = '0'
      toggleBtn.style.transition = 'left 0.3s ease'
    }
  } else {
    // 展开侧边栏
    sidebar.style.transform = 'translateX(0)'

    // 恢复内容区域
    if (content) {
      content.style.paddingLeft = ''
    }

    // 恢复按钮位置 - 继续右移10px
    if (toggleBtn) {
      toggleBtn.style.left = '380px'
    }
  }
}
</script>

<style scoped>
.sidebar-toggle-btn {
  position: fixed;
  left: 380px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  width: 20px;
  height: 60px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-left: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease, left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

.sidebar-toggle-btn:hover {
  width: 24px;
  background: var(--vp-c-brand-1);
  box-shadow: 3px 0 12px rgba(0, 0, 0, 0.15);
  border-color: var(--vp-c-brand-1);
}

.icon {
  width: 14px;
  height: 14px;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
}

.sidebar-toggle-btn:hover .icon {
  color: white;
  transform: scale(1.1);
}

/* 只在桌面端显示 */
@media (max-width: 959px) {
  .sidebar-toggle-btn {
    display: none;
  }
}

/* 暗黑模式 */
.dark .sidebar-toggle-btn {
  background: var(--vp-c-bg-soft);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.dark .sidebar-toggle-btn:hover {
  background: var(--vp-c-brand-1);
  box-shadow: 3px 0 16px rgba(0, 0, 0, 0.4);
}
</style>